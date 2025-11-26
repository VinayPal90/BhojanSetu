// backend/server.js (Optimized CORS Configuration)

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet'; // Security Headers
import { Server } from 'socket.io'; 
import http from 'http'; 
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js'; 
import donationRoutes from './routes/donationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

// Database Connection
connectDB();

// ------------------- CORS Configuration -------------------
const allowedOrigins = [
    process.env.CLIENT_URL, 
    "http://localhost:5173", 
    "http://localhost:3000"
];

const corsOptions = {
    origin: (origin, callback) => {
        // अगर origin allowed है या यह same origin request है (origin undefined)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS for origin: ${origin}`));
        }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    // Preflight (OPTIONS) रिक्वेस्ट के लिए status code को 204 की जगह 200 पर सेट करें
    optionsSuccessStatus: 200 
};

// Middlewares
app.use(helmet()); 

// CORS Middleware apply किया
app.use(cors(corsOptions)); 

// यह सुनिश्चित करने के लिए कि सभी routes के लिए OPTIONS request सही ढंग से handled हो
// यह अक्सर 'Access-Control-Allow-Origin' missing error को 204 status code के साथ हल करता है।
app.options('*', cors(corsOptions)); 


app.use(express.json()); // JSON data को parse करने के लिए

// ------------------- SOCKET.IO SETUP -------------------
const io = new Server(server, {
    pingTimeout: 60000,
    cors: corsOptions // Express और Socket.io के लिए एक ही config का उपयोग करें
});

// ... (Socket.io Connection Logic remains the same)
io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

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

// Server Listen
server.listen(PORT, () => {
    console.log(`Server started successfully on port ${PORT}`);
});
