// backend/src/config/db.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
// .env file humne server.js mein load kar diya tha, par yahan bhi import kar lete hain safety ke liye.
dotenv.config(); 

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Yeh options newer versions mein default ho chuke hain,
      // par compatibility ke liye likh sakte hain.
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Agar DB connect nahi hui to application band kar denge.
    process.exit(1); 
  }
};

export default connectDB;