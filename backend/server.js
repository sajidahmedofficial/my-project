import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import aptitudeRoutes from './routes/aptitude.routes.js';

// Load environmental parameters
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing mounts
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api', aptitudeRoutes); // Alias mount for direct /api/topics, /api/quiz, /api/questions

// Base route checker
app.get('/', (req, res) => {
  res.json({ message: 'AI Placement Aptitude Engine Server is running...' });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server executing successfully on port ${PORT}`);
});
