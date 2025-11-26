// backend/controllers/contactController.js

import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

// Nodemailer transporter setup - Optimized for Cloud Deployment (Port 587 is preferred for TLS)

sgMail.setApiKey(process.env.SENDGRID_API_KEY); 

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


const { email } = req.body;  // agar frontend se email aata hai
// ya
const email = req.user.email;  // agar user login hai to

await sgMail.send({
  to: email,  // yaha pr sahi email use karo
  from: process.env.EMAIL_USER,
  subject: 'BhojanSetu OTP Verification',
  html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
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
