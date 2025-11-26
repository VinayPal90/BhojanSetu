// backend/controllers/contactController.js

import nodemailer from 'nodemailer';

// Nodemailer transporter setup - Optimized for Cloud Deployment (Port 587 is preferred for TLS)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // FIX 1: Port 465 (SSL) से Port 587 (TLS) पर स्विच किया
    secure: false, // FIX 2: Port 587 के लिए secure: false (STARTTLS)
    auth: {
        user: process.env.EMAIL_USER, // आपकी email ID (.env से)
        pass: process.env.EMAIL_PASS // आपका App Password (.env से)
    },
    // Timeout सेटिंग्स
    timeout: 10000, 
    connectionTimeout: 10000, 
    socketTimeout: 10000,
    logger: true, // Debugging के लिए Console में SMTP traffic दिखाता है
    debug: true
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

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.CONTACT_RECEIVER_EMAIL, // वह ईमेल ID जहाँ message प्राप्त होगा
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

        console.log(`Attempting to send contact email from ${email} via SMTP Port 587...`);
        // Email bhejein
        await transporter.sendMail(mailOptions);
        console.log(`Contact email sent successfully.`);

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully!'
        });

    } catch (error) {
        // NODEMAILER FAILED: Log the error and send a 500 response
        console.error('NODEMAILER FAILED - Connection Timeout/Error:', error.message);
        res.status(500).json({
            success: false,
            // यह message क्लाइंट को भेजा गया था
            message: 'Failed to send message. Please check SMTP credentials and network access.',
            detail: error.message // Server log में सटीक error message दिखाएगा
        });
    }
};
