// backend/server.js (Updated Code with Robust CORS Configuration)

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
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app); // HTTP Server create kiya

// Database Connection
connectDB();

// ------------------- CORS Configuration -------------------
const allowedOrigins = [
    process.env.CLIENT_URL, 
    "http://localhost:5173", 
    "http://localhost:3000"
];

const corsOptions = {
    // Dynamic origin checking
    origin: (origin, callback) => {
        // अगर origin allowedOrigins में है, या कोई origin नहीं है (जैसे same-origin requests/Postman), तो अनुमति दें
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // console.log(`Blocked CORS request from origin: ${origin}`); // Debugging के लिए
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // Preflight requests के लिए status code 204 की जगह 200 सेट करें (कुछ environments में 204 से समस्या आती है)
    optionsSuccessStatus: 200 
};

// Middlewares
app.use(helmet());
app.use(cors(corsOptions)); // CORS Middleware apply किया

// Preflight request (OPTIONS) को मैन्युअली हैंडल करें (यह सुनिश्चित करने के लिए कि CORS headers हमेशा भेजे जाएँ)
// यह 'Access-Control-Allow-Origin' missing error को 204 status code के साथ हल कर सकता है
app.options('*', cors(corsOptions)); 

app.use(express.json());

// ------------------- SOCKET.IO SETUP -------------------
const io = new Server(server, {
    pingTimeout: 60000,
    cors: corsOptions // Socket.io के लिए भी उसी corsOptions का उपयोग करें
});

// Socket.io Connection Logic
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

// Server को 'server' object से listen करवाओ
server.listen(PORT, () => {
    console.log(`Server started successfully on port ${PORT}`);
});
