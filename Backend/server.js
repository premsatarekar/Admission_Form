// app.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import './config/db.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import coursesKaushalKendraRoutes from './routes/coursesKaushalKendraRoutes.js';
import kaushalKendraRoutes from './routes/kaushalKendraRoutes.js';
import vizionexlRoutes from './routes/vizionexlRoutes.js';

dotenv.config();
const app = express();

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests, please try again later.',
  })
);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) =>
  res.send('🚀 Server is running and MySQL is connected ✅')
);
app.post('/api/test-echo', (req, res) =>
  res.json({ ok: true, body: req.body })
);
app.use('/api/courses', courseRoutes);
app.use('/api/courses-kaushal-kendra', coursesKaushalKendraRoutes);
app.use('/api/vizionexl', vizionexlRoutes);
app.use('/api/kaushal-kendra', kaushalKendraRoutes);
app.use('/api/auth', authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
