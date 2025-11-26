// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import http from 'http';
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js'; 
import donationRoutes from './routes/donationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import messageRoutes from './routes/messageRoutes.js'; // Ensure this import is included

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

// --- FIX: CLIENT_URLS Array Define Kiya Gaya ---
// Deployment environment variables Render se milenge, aur local fallback yahan hai
const CLIENT_URLS = [
    process.env.CLIENT_URL, 
    "http://localhost:5173", 
    "http://localhost:3000"
].filter(Boolean); // Blank strings ko filter out kar dega
// --------------------------------------------------

// Database Connection
connectDB();

// Middlewares
app.use(helmet());

// FIX: CORS configuration
app.use(cors({
    origin: CLIENT_URLS, // <-- Ab CLIENT_URLS defined hai
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use(express.json());

// ------------------- SOCKET.IO SETUP -------------------
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: CLIENT_URLS, // <-- Yahan bhi CLIENT_URLS use kiya
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Socket.io Connection Logic (Code remains the same)
io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);
    // ... (Socket logic remains the same)
    socket.on('join_chat_room', (donationId) => {
        socket.join(donationId);
        console.log(`User joined room: ${donationId}`);
    });
    socket.on('new_message', (newMessage) => {
        socket.to(newMessage.donation).emit('message_received', newMessage);
        console.log(`Message sent to room ${newMessage.donation}`);
    });
    socket.on('disconnect', () => {
        console.log(`Socket Disconnected: ${socket.id}`);
    });
});


// ------------------- API ROUTES -------------------
app.use('/api/v1/auth', authRouter); 
app.use('/api/v1/donations', donationRoutes); 
app.use('/api/v1/contact', contactRoutes); 
app.use('/api/v1/messages', messageRoutes); 

// Test Route
app.get('/', (req, res) => {
    res.status(200).json({
        message: `BhojanSetu Backend is Running Smoothly on Port ${PORT}`,
        environment: process.env.NODE_ENV
    });
});

server.listen(PORT, () => {
    console.log(`Server started successfully on port ${PORT}`);
});
