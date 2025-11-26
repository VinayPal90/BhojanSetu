// backend/controllers/authController.js

import User from '../models/User.js';
import Donation from '../models/Donation.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; 
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY); 

// Nodemailer setup (Using SendGrid SMTP via API Key)
// const transporter = nodemailer.createTransport({
//     // FIX: SendGrid SMTP Host और Auth अपडेट किया गया
//     host: 'smtp.sendgrid.net', // SendGrid SMTP Server
//     port: 587, // Standard TLS port for SendGrid
//     secure: false, // Use STARTTLS on port 587
//     auth: {
//         user: 'apikey', // SendGrid के लिए यूजर हमेशा 'apikey' होता है
//         pass: process.env.SENDGRID_API_KEY // Render Env Var: SendGrid API Key
//     },
//     timeout: 10000, 
//     connectionTimeout: 10000, 
//     socketTimeout: 10000,
//     logger: true, 
//     debug: true
// });

await sgMail.send({
  to: user.email,                 // jisko OTP bhejna hai
  from: process.env.EMAIL_USER,   // SendGrid me verified sender
  subject: 'BhojanSetu OTP Verification',
  html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
});


// Helper function to generate and send OTP
const sendOtpEmail = async (user) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
        user.verificationOtp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
        await user.save();

        const mailOptions = {
            // From Address के लिए EMAIL_USER का उपयोग जारी रखें
            from: process.env.EMAIL_USER, 
            to: user.email,
            subject: 'BhojanSetu Email Verification OTP',
            html: `<h3>Your Verification OTP for BhojanSetu is:</h3><h1>${otp}</h1><p>This code is valid for 10 minutes.</p>`
        };

        console.log(`Attempting to send OTP to ${user.email} via SendGrid SMTP...`);
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${user.email}`);
        return true;
    } catch (error) {
        console.error("OTP Send Error (SendGrid Connection Failed):", error.message || error);
        user.verificationOtp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return false;
    }
};


// --- 1. REGISTER USER ---
export const registerController = async (req, res) => {
    try {
        const { name, email, password, role, phone, address, ngoRegistrationId } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered. Please Login.' });
        }

        const user = await User.create({
            name, 
            email, 
            password, 
            role: role || 'donor', 
            phone, 
            address, 
            isVerified: false,
            ngoRegistrationId: role === 'ngo' ? ngoRegistrationId : undefined 
        });
        
        const emailSent = await sendOtpEmail(user);

        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Registration successful, but failed to send verification email (SendGrid Error). Please ensure your API Key is correct and try Resend OTP.' });
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful. OTP sent to your email for verification.',
            needsVerification: true,
            userEmail: user.email 
        });

    } catch (error) {
        console.error("Error in Registration:", error);
        res.status(500).json({ success: false, message: 'Error in Registration API', error: error.message });
    }
};

// --- 2. VERIFY EMAIL ---
export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const user = await User.findOne({ email }).select('+verificationOtp +otpExpires');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified.' });
        }
        
        if (user.verificationOtp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        user.isVerified = true;
        user.verificationOtp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            message: 'Email successfully verified. Login successful.',
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: true }
        });

    } catch (error) {
        console.error("Error in Verification:", error);
        res.status(500).json({ success: false, message: 'Error during email verification.' });
    }
};

// --- 3. RESEND OTP ---
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email }).select('+verificationOtp +otpExpires');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified.' });
        }

        const emailSent = await sendOtpEmail(user);

        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Failed to resend verification email (SendGrid Error).' });
        }

        res.status(200).json({ success: true, message: 'New OTP sent to your email.' });

    } catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).json({ success: false, message: 'Error resending OTP.' });
    }
};


// --- 4. LOGIN USER ---
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // CHECK: Email verification
        if (!user.isVerified) {
            const emailSent = await sendOtpEmail(user); 
            const emailStatusMessage = emailSent 
                ? 'New OTP sent to your email.' 
                : 'Failed to send OTP. Please check your API Key.';

            return res.status(401).json({ 
                success: false, 
                message: `Email not verified. ${emailStatusMessage}`, 
                needsVerification: true, 
                userEmail: user.email 
            });
        }
        
        const isMatch = await user.matchPassword(password); 
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid Credentials (Wrong Password)' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            message: 'Login Successfully',
            token,
            user: {
                _id: user._id, name: user.name, email: user.email, role: user.role,
                phone: user.phone, address: user.address, isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error("Error in Login API:", error);
        res.status(500).json({ success: false, message: 'Error in Login API', error: error.message });
    }
};

// --- 5. GET PROFILE ---
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (user) {
            res.status(200).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    ngoRegistrationId: user.ngoRegistrationId,
                    isVerified: user.isVerified
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};


// --- 6. UPDATE PROFILE ---
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email; 
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.ngoRegistrationId = req.body.ngoRegistrationId || user.ngoRegistrationId;

            if (req.body.newPassword) {
                user.password = req.body.newPassword; 
            }

            const updatedUser = await user.save();
            
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                    isVerified: updatedUser.isVerified
                }
            });

        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: 'Server error updating profile', error: error.message });
    }
};

// **********************************************
// ************** ADMIN FUNCTIONALITY *************
// **********************************************

// --- 7. Get all users (for Admin) ---
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['donor', 'ngo'] } }).select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ success: false, message: 'Server error fetching users' });
    }
};


// --- 8. Verify/Toggle User Status (Admin only) ---
export const updateUserVerificationStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { isVerified } = req.body; 

        if (typeof isVerified !== 'boolean') {
             return res.status(400).json({ success: false, message: 'Verification status is required.' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        user.isVerified = isVerified;
        await user.save();

        res.status(200).json({
            success: true,
            message: `${user.role.toUpperCase()} ${user.name} verification status updated.`,
            data: user
        });

    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ success: false, message: 'Server error updating status' });
    }
};


// --- 9. Get System Statistics (Admin only) ---
export const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $in: ['donor', 'ngo'] } });
        const totalNGOs = await User.countDocuments({ role: 'ngo', isVerified: true });
        const totalDonations = await Donation.countDocuments();
        const pendingDonations = await Donation.countDocuments({ status: 'pending' });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalNGOs,
                totalDonations,
                pendingDonations
            }
        });
    } catch (error) {
        console.error("Error fetching system stats:", error);
        res.status(500).json({ success: false, message: 'Server error fetching stats' });
    }
};
