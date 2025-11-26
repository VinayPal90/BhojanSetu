// backend/controllers/contactController.js

import nodemailer from 'nodemailer';

// Nodemailer transporter setup karein (Gmail ke liye)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Agar aap koi aur service (jaise Outlook/SendGrid) use karte hain, to badal dein
    auth: {
        user: process.env.EMAIL_USER, // Aapki email ID (.env se)
        pass: process.env.EMAIL_PASS  // Aapka App Password (.env se)
    }
});

// @desc    Handle Contact Form Submission and send email
// @route   POST /api/v1/contact
// @access  Public
export const sendContactEmail = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Please fill out all fields.' });
        }

        // Email content jo aapko receive hoga
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.CONTACT_RECEIVER_EMAIL, // Aapki official email jahan message aayega
            subject: `New Contact Inquiry from BhojanSetu: ${name}`,
            html: `
                <h3>Contact Details</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <hr>
                <h3>Message</h3>
                <p>${message}</p>
            `,
        };

        // Email bhejein
        await transporter.sendMail(mailOptions);

        // Client ko success response de
        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully!'
        });

    } catch (error) {
        console.error('Nodemailer Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please check server logs (Nodemailer error).'
        });
    }
};