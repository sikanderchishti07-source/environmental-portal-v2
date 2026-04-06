// ════════════════════════════════════════════════════════════
//  AECON Client Portal — Express Backend
//  server.js  ·  Entry point
// ════════════════════════════════════════════════════════════
require('dotenv').config();

const express     = require('express');
const mongoose    = require('mongoose');
const cors        = require('cors');
const path        = require('path');
const rateLimit   = require('express-rate-limit');

const clientRoutes = require('./routes/clients');
const reportRoutes = require('./routes/reports');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS ────────────────────────────────────────────────────
// In production, restrict to your actual domain.
app.use(cors({
  origin: [
    process.env.FRONTEND_ORIGIN || 'http://localhost',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
    'https://environmental-portal-v2.vercel.app',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin-key']
}));

// ── Body parsers ─────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Serve uploaded files publicly ────────────────────────────
// e.g. GET /uploads/DIR-SAS-001/1234567890-report.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Serve admin panel ─────────────────────────────────────────
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ── Rate limiter (public routes) ─────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 60,                    // 60 requests per IP per window
  message: { error: 'Too many requests — slow down.' }
});
app.use('/api/', limiter);

// ── Routes ───────────────────────────────────────────────────
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AECON Client Portal API',
    time: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

// ── MongoDB connection ────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000
  })
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀  AECON Portal API running on http://localhost:${PORT}`);
      console.log(`📁  Admin panel: http://localhost:${PORT}/admin`);
    });
  })
  .catch(err => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
