// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io'; // Socket.io server
import http from 'http'; // HTTP module
import connectDB from './config/db.js';

// Routes Import
import authRouter from './routes/authRoutes.js'; 
import donationRoutes from './routes/donationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app); // HTTP server create kiya

// Database Connection
connectDB();

// Middlewares
app.use(helmet());

// --- FIX: Dynamic Allowed Origins (CORS Fail-Safe) ---
const localOrigins = [
    "http://localhost:5173", 
    "http://localhost:3000"
];

const allowedOrigins = [...localOrigins];

// Production/Deployment Environment mein, CLIENT_URL (Render Env Var) ko add karein
if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
} 
// --------------------------------------------------

// FIX: CORS configuration ko robust kiya gaya
app.use(cors({
    // FIX: Origin ko ek function diya jo dynamic tarike se Render ya Localhost ko allow karega
    origin: (origin, callback) => {
        // Agar request same origin se hai ya allowed list mein hai, to allow karein
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Render ya Netlify ke dynamic URLs ko allow karne ke liye ek fail-safe check
            if (origin.endsWith('.onrender.com') || origin.endsWith('.netlify.app')) {
                 callback(null, true);
            } else {
                 // Agar origin allowed nahi hai, to error do
                 console.log("Blocked by CORS:", origin); // Debugging ke liye log
                 callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

app.use(express.json());

// ------------------- SOCKET.IO SETUP -------------------
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        // Socket.io ke liye bhi same logic
        origin: allowedOrigins, 
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Join Chat Room
    socket.on('join_chat_room', (donationId) => {
        socket.join(donationId);
        console.log(`User joined room: ${donationId}`);
    });

    // New Message Handling
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
        environment: process.env.NODE_ENV,
        frontend_url: process.env.CLIENT_URL 
    });
});

// Server Listen (Note: 'server.listen' use karein, 'app.listen' nahi, taaki Socket.io chale)
server.listen(PORT, () => {
    console.log(`Server started successfully on port ${PORT}`);
});
