// backend/server.js (Update Code: Adding Socket.io)

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io'; // <-- Socket.io Server Import
import http from 'http'; // <-- HTTP module import
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js'; 
import donationRoutes from './routes/donationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app); // HTTP Server create kiya

// Database Connection
connectDB();

// Middlewares
app.use(helmet());
// FIX: CORS ko Socket.io ke liye bhi set karna padega
// FIX: CORS configuration ko robust kiya gaya
app.use(cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Sabhi methods allow kiye
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers allow kiye
}));
app.use(express.json());

// ------------------- SOCKET.IO SETUP -------------------
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: CLIENT_URLS,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Jab client join hota hai, hum use uski Donation ID (room) mein daal denge
    // room name hoga: `donation-id`
    socket.on('join_chat_room', (donationId) => {
        socket.join(donationId);
        console.log(`User joined room: ${donationId}`);
    });

    // Jab koi naya message aata hai
    socket.on('new_message', (newMessage) => {
        // Message ko uss room mein broadcast karo
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

// Server ko 'server' object se listen karwao, na ki 'app' se
server.listen(PORT, () => {
    console.log(`Server started successfully on port ${PORT}`);
});
