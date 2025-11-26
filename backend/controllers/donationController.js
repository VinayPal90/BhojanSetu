// backend/controllers/donationController.js (Update Code)

import Donation from '../models/Donation.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// Nodemailer setup (Contact API se reuse kiya gaya)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// --- Existing Controllers (createDonation, getAllDonations, assignDonation, generateAndSendOtp, updateDonationStatus, clearDeliveryHistory) remain the same ---
// (Note: For brevity, existing functions are omitted here, but must be in your file)


// @desc    1. Create a new donation request
// @route   POST /api/v1/donations/create
// @access  Private 
export const createDonation = async (req, res) => {
    try {
        const { foodItems, expiryDate, pickupLocation, notes } = req.body;

        if (!foodItems || foodItems.length === 0 || !expiryDate || !pickupLocation || !pickupLocation.address) {
             return res.status(400).json({ success: false, message: 'Please provide food items, expiry date, and pickup address.' });
        }

        const donation = await Donation.create({
            donor: req.user._id, 
            foodItems,
            expiryDate,
            pickupLocation,
            notes
        });

        res.status(201).json({
            success: true,
            message: 'Donation request created successfully.',
            data: donation
        });

    } catch (error) {
        console.error("Error creating donation:", error);
        res.status(500).json({
            success: false,
            message: 'Server error creating donation.',
            error: error.message
        });
    }
};

// @desc    2. Get all donations (NGO/Admin View)
// @route   GET /api/v1/donations
// @access  Private (NGO, Admin)
export const getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ 
                $or: [
                    { status: 'pending' },
                    { assignedTo: req.user.id, status: { $in: ['assigned', 'picked', 'delivered', 'expired'] } }
                ]
            })
            .populate('donor', 'name email phone address') 
            .populate('assignedTo', 'name email phone') 
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: donations.length,
            data: donations
        });

    } catch (error) {
        console.error("Error fetching donations:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching donations.',
            error: error.message
        });
    }
};

// @desc    3. Assign (Accept) a pending donation to the current NGO
// @route   PUT /api/v1/donations/assign/:id
// @access  Private (NGO, Admin)
export const assignDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found.' });
        }

        if (donation.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Donation already ${donation.status}.` });
        }
        
        donation.status = 'assigned';
        donation.assignedTo = req.user._id; 
        donation.pickupTime = new Date(); 

        const updatedDonation = await donation.save();

        res.status(200).json({
            success: true,
            message: 'Donation successfully accepted and assigned for pickup!',
            data: updatedDonation
        });

    } catch (error) {
        console.error("Error assigning donation:", error);
        res.status(500).json({
            success: false,
            message: 'Server error assigning donation.',
            error: error.message
        });
    }
};

// @desc    4. Generate OTP and Send Email to Donor
// @route   POST /api/v1/donations/send-otp/:id
// @access  Private (NGO, Admin)
export const generateAndSendOtp = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id).populate('donor');
        if (!donation) return res.status(404).json({ message: 'Donation not found' });
        if (!donation.donor || !donation.donor.email) return res.status(400).json({ message: 'Donor email not found.' });
        
        if (donation.assignedTo.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not assigned to you.' });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        donation.pickupOtp = otp;
        await donation.save();

        const donorEmail = donation.donor.email;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: donorEmail, 
            subject: 'BhojanSetu Pickup Verification OTP',
            html: `<h3>Your OTP for pickup:</h3><h1>${otp}</h1><p>Please share this 4-digit code with the NGO agent, ${req.user.name}.</p>`
        };

        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ 
            success: true, 
            message: `OTP sent successfully to Donor's email: ${donorEmail}`,
            donorEmail: donorEmail
        });

    } catch (error) {
        console.error("OTP Nodemailer Error:", error);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Check SMTP credentials.' });
    }
};

// @desc    5. Update donation status (Picked/Delivered) with OTP verification
// @route   PUT /api/v1/donations/status/:id
// @access  Private (NGO, Admin)
export const updateDonationStatus = async (req, res) => {
    try {
        const { status, otp } = req.body;
        const donation = await Donation.findById(req.params.id);
        
        if (!donation) return res.status(404).json({ message: 'Not found' });
        
        if (donation.assignedTo && donation.assignedTo.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to change status.' });
        }

        // --- OTP Verification Logic for 'Picked' Status ---
        if (status === 'picked') {
            if (donation.status !== 'assigned') {
                return res.status(400).json({ message: 'Donation must be assigned before being picked.' });
            }
            if (!otp) {
                return res.status(400).json({ message: 'Please enter the OTP.' });
            }
            if (donation.pickupOtp !== otp) {
                return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
            }
            // Verification successful
            donation.pickedAt = new Date();
            donation.pickupOtp = undefined; 
        }
        // ------------------------------------------------

        // Status update logic for Delivered
        if (status === 'delivered') {
            if (donation.status !== 'picked') {
                return res.status(400).json({ message: 'Donation must be picked up before being delivered.' });
            }
            donation.deliveredAt = new Date();
        }

        donation.status = status;
        await donation.save();

        res.status(200).json({ success: true, message: `Status updated to ${status}!`, data: donation });

    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    6. Clear Delivery History (Delete delivered items for current NGO)
// @route   DELETE /api/v1/donations/history
// @access  Private (NGO, Admin)
export const clearDeliveryHistory = async (req, res) => {
    try {
        const result = await Donation.deleteMany({ 
            assignedTo: req.user.id, // req.user.id is correct here (mongoose automatically converts to ObjectId)
            status: { $in: ['delivered', 'expired'] } 
        });

        res.status(200).json({ 
            success: true, 
            message: `Cleared ${result.deletedCount} history records!` 
        });
    } catch (error) {
        console.error("Error clearing history:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// @desc    7. Get Donor's specific donation history (FIX: For Donor My Donations Page)
// @route   GET /api/v1/donations/my-donations
// @access  Private (Donor, Admin)
export const getMyDonations = async (req, res) => {
    try {
        // FIX: sirf current logged-in user ki donations find karein
        const donations = await Donation.find({ donor: req.user.id })
            .populate('assignedTo', 'name email phone') // Kis NGO ko assigned hua
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: donations.length,
            data: donations
        });

    } catch (error) {
        console.error("Error fetching my donations:", error);
        res.status(500).json({ success: false, message: 'Server error fetching my donations', error: error.message });
    }
};