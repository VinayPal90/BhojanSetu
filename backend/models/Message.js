// backend/models/Message.js

import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    // Kis Donation thread se juda hai (Har Donation ka apna Chat Thread hoga)
    donation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        required: true
    },
    // Message kisne bheja
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Message ka content
    content: {
        type: String,
        trim: true,
        required: true
    },
    // Message kab bheja gaya
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

export default mongoose.model('Message', MessageSchema);