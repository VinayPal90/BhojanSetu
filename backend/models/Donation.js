// backend/models/Donation.js

import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foodItems: [
        {
            name: { type: String, required: true },
            quantity: { type: String, required: true },
        }
    ],
    expiryDate: {
        type: Date,
        required: true
    },
    pickupLocation: {
        address: { type: String, required: true },
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'picked', 'delivered', 'expired'],
        default: 'pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    pickupTime: {
        type: Date
    },
    pickedAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    notes: {
        type: String
    },
    // OTP for Pickup Verification
    pickupOtp: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model('Donation', DonationSchema);