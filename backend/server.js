import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import logRoutes from './routes/logRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
// Log HTTP requests while skipping noisy health check heartbeats
app.use(
  morgan('dev', {
    skip: (req) => req.url === '/api/health' || req.path === '/api/health',
  })
);

// Health & Status check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

  res.status(200).json({
    success: true,
    status: 'pulseOps API is running',
    timestamp: new Date().toISOString(),
    database: {
      status: states[dbState] || 'Unknown',
      host: mongoose.connection.host || 'MongoDB Atlas',
      name: mongoose.connection.name || 'pulseOps',
    },
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/logs', logRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.send('⚡ pulseOps MERN Backend API is active and running.');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start standalone HTTP listener if not running as serverless function
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 pulseOps Backend Server running on http://localhost:${PORT}`);
  });
}

export default app;
