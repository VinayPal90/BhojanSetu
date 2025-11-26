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
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

// ----------------------- CLIENT URLS -----------------------
const CLIENT_URLS = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

// --------------------- MIDDLEWARES -------------------------
app.use(helmet());

// **SUPER IMPORTANT FIX**
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || CLIENT_URLS.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE'],
    allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json());

// ------------------- SOCKET.IO ------------------------------
const io = new Server(server, {
    cors: {
        origin: CLIENT_URLS,
        methods: ["GET", "POST"],
        credentials: true,
    },
    pingTimeout: 60000,
});

io.on('connection', (socket) => {
    console.log("Socket Connected:", socket.id);

    socket.on('join_chat_room', (donationId) => {
        socket.join(donationId);
    });

    socket.on('new_message', (newMessage) => {
        socket.to(newMessage.donation).emit('message_received', newMessage);
    });

    socket.on('disconnect', () => {
        console.log("Socket Disconnected:", socket.id);
    });
});

// ----------------------- ROUTES -----------------------------
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/messages', messageRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Backend Running Successfully", env: process.env.NODE_ENV });
});

// ------------------------ SERVER -----------------------------
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
