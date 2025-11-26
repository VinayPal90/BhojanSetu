// backend/models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    // 1. NAME (Required)
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    // 2. EMAIL (Required & Unique)
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    // 3. PASSWORD (Required)
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false 
    },
    // 4. ROLE (FIXED: Required for verification)
    role: {
        type: String,
        enum: ['donor', 'ngo', 'admin'],
        default: 'donor'
    },
    // 5. PHONE (FIXED: Added for saving)
    phone: {
        type: String,
        maxlength: [20, 'Phone number cannot be longer than 20 characters']
    },
    // 6. ADDRESS (Required)
    address: {
        type: String,
        required: [true, 'Please add an address'],
    },
    // 7. NGO ID (Conditional Required)
    ngoRegistrationId: {
        type: String,
        required: function() { return this.role === 'ngo'; } 
    },
    // 8. VERIFICATION STATUS
    isVerified: {
        type: Boolean,
        default: false
    },
    // 9. OTP Fields for Email Verification
    verificationOtp: {
        type: String,
        select: false 
    },
    otpExpires: {
        type: Date, 
        select: false
    }
}, {
    timestamps: true
});

// 1. Password Hashing Middleware
UserSchema.pre('save', async function() { 
    if (!this.isModified('password')) {
        return; 
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 2. Password Comparison Method
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);