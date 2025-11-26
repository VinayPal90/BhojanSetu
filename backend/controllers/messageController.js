// backend/controllers/messageController.js

import Message from '../models/Message.js';
import Donation from '../models/Donation.js';

// @desc    1. Get all messages for a specific donation thread
// @route   GET /api/v1/messages/:donationId
// @access  Private 
export const allMessages = async (req, res) => {
    try {
        const donationId = req.params.donationId;
        const currentUserId = req.user._id;
        
        const donation = await Donation.findById(donationId);
        
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found.' });
        }
        
        const isParticipant = donation.donor.toString() === currentUserId.toString() ||
                              (donation.assignedTo && donation.assignedTo.toString() === currentUserId.toString()) ||
                              req.user.role === 'admin';
        
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this chat.' });
        }


        const messages = await Message.find({ donation: donationId })
            .populate("sender", "name email role") 
            .sort({ createdAt: 1 }); 

        res.status(200).json({ success: true, data: messages });

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, message: 'Server error fetching messages.' });
    }
};

// @desc    2. Send a new message
// @route   POST /api/v1/messages
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { donationId, content } = req.body;
        
        if (!donationId || !content) {
            return res.status(400).json({ success: false, message: "Invalid data passed into request." });
        }

        let newMessage = {
            sender: req.user._id,
            content: content,
            donation: donationId,
        };

        let message = await Message.create(newMessage);
        
        message = await message.populate("sender", "name email role");
        
        res.status(201).json({ success: true, data: message });

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, message: 'Server error sending message.' });
    }
};

// @desc    3. Clear Chat History for a specific donation
// @route   DELETE /api/v1/messages/:donationId
// @access  Private (Participants only)
export const clearChatHistory = async (req, res) => {
    try {
        const donationId = req.params.donationId;
        const currentUserId = req.user._id;

        // Security: Check karein ki user is chat thread ka participant hai
        const donation = await Donation.findById(donationId);
        
        const isParticipant = donation.donor.toString() === currentUserId.toString() ||
                              (donation.assignedTo && donation.assignedTo.toString() === currentUserId.toString()) ||
                              req.user.role === 'admin';
        
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Not authorized to clear this chat.' });
        }

        // Messages delete karein
        const result = await Message.deleteMany({ donation: donationId });

        res.status(200).json({ success: true, message: `Cleared ${result.deletedCount} messages.` });

    } catch (error) {
        console.error("Error clearing chat:", error);
        res.status(500).json({ success: false, message: 'Server error clearing chat.' });
    }
};