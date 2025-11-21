require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------
// 🔥 FIXED CORS CONFIG
// ---------------------------
app.use(
  cors({
    origin: "http://localhost:5175",   // React frontend
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);

// ❗ NO app.options("*") — Express 5 crashes otherwise

// ---------------------------
// Middleware
// ---------------------------
app.use(express.json());

// ---------------------------
// MongoDB Connection
// ---------------------------
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI is not defined in .env. Database connection will fail.');
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};

connectDB();

// ---------------------------
// Routes
// ---------------------------
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('Zero Gravity API is running');
});

// ---------------------------
// Server Start
// ---------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
