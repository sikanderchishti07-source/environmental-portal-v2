const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const Report     = require('../models/Report');
const Client     = require('../models/Client');
const adminAuth  = require('../middleware/adminAuth');

// ── File upload config ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', req.params.clientId || 'general');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|jpg|jpeg|png|gif|webp/;
  const ext     = path.extname(file.originalname).toLowerCase().slice(1);
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error(`File type .${ext} is not allowed.`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }  // 50 MB max per file
});


// ════════════════════════════════════════════════════════════
//  PUBLIC ROUTES (called by the frontend dashboard)
// ════════════════════════════════════════════════════════════

/**
 * GET /api/reports/:clientId
 * Returns all PUBLISHED reports for a client, sorted newest first.
 * No admin key needed — the clientId acts as the access token.
 */
router.get('/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId.toUpperCase();

    // Verify client exists
    const client = await Client.findOne({ clientId, isActive: true });
    if (!client) {
      return res.status(404).json({ error: 'Invalid Client ID.' });
    }

    const reports = await Report.find({ clientId, isPublished: true })
      .sort({ serviceDate: -1 })
      .select('-__v -uploadedBy');

    return res.json({
      clientId,
      companyName: client.companyName,
      count: reports.length,
      reports
    });
  } catch (err) {
    console.error('[GET /reports/:clientId]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});


// ════════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ════════════════════════════════════════════════════════════

/**
 * POST /api/reports/:clientId
 * Admin uploads a new report with optional file attachments.
 *
 * Form fields (multipart/form-data):
 *   reportTitle, reportType, serviceDate, reportDate,
 *   location, projectRef, summary, complianceStandard,
 *   overallStatus, isPublished
 *   measurements[pm25], measurements[pm10], etc.
 *
 * Files (optional):
 *   pdfReport (single), stationImages (multi),
 *   noiseImages (multi), coordinateImages (multi)
 */
router.post('/:clientId', adminAuth, upload.fields([
  { name: 'pdfReport',        maxCount: 1 },
  { name: 'stationImages',    maxCount: 10 },
  { name: 'noiseImages',      maxCount: 10 },
  { name: 'coordinateImages', maxCount: 10 },
  { name: 'otherFiles',       maxCount: 5 }
]), async (req, res) => {
  try {
    const clientId = req.params.clientId.toUpperCase();

    // Verify client exists
    const client = await Client.findOne({ clientId, isActive: true });
    if (!client) {
      return res.status(404).json({ error: 'Client ID not found.' });
    }

    const {
      reportTitle, reportType, serviceDate, reportDate,
      location, projectRef, summary, complianceStandard,
      overallStatus, isPublished
    } = req.body;

    if (!reportTitle || !reportType || !serviceDate || !reportDate || !location) {
      return res.status(400).json({ error: 'reportTitle, reportType, serviceDate, reportDate, and location are required.' });
    }

    // Parse measurements
    const m = req.body.measurements || {};
    const measurements = {};
    ['pm25', 'pm10', 'no2', 'so2', 'co', 'noise'].forEach(key => {
      if (m[key] !== undefined) {
        measurements[key] = {
          value:  parseFloat(m[key]),
          status: m[`${key}_status`] || 'pending'
        };
      }
    });

    // Build file paths (relative to /uploads/)
    const files = {};
    if (req.files?.pdfReport?.[0])
      files.pdfReport = `/uploads/${clientId}/${req.files.pdfReport[0].filename}`;
    if (req.files?.stationImages)
      files.stationImages = req.files.stationImages.map(f => `/uploads/${clientId}/${f.filename}`);
    if (req.files?.noiseImages)
      files.noiseImages = req.files.noiseImages.map(f => `/uploads/${clientId}/${f.filename}`);
    if (req.files?.coordinateImages)
      files.coordinateImages = req.files.coordinateImages.map(f => `/uploads/${clientId}/${f.filename}`);
    if (req.files?.otherFiles)
      files.otherFiles = req.files.otherFiles.map(f => `/uploads/${clientId}/${f.filename}`);

    const report = await Report.create({
      clientId,
      reportTitle,
      reportType,
      serviceDate:         new Date(serviceDate),
      reportDate:          new Date(reportDate),
      location,
      projectRef,
      summary,
      complianceStandard:  complianceStandard || 'NCEC SAAQS',
      overallStatus:       overallStatus || 'pending',
      measurements,
      files,
      isPublished:         isPublished === 'true' || isPublished === true,
      uploadedBy:          'admin'
    });

    return res.status(201).json({ message: 'Report created successfully.', report });
  } catch (err) {
    console.error('[POST /reports/:clientId]', err);
    return res.status(500).json({ error: err.message || 'Server error.' });
  }
});

/**
 * GET /api/reports/admin/all
 * List ALL reports across all clients (admin only).
 */
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 }).select('-__v');
    return res.json({ count: reports.length, reports });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * PATCH /api/reports/admin/:reportId
 * Update report metadata or toggle isPublished.
 */
router.patch('/admin/:reportId', adminAuth, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    return res.json({ message: 'Updated.', report });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * DELETE /api/reports/admin/:reportId
 * Permanently delete a report and its files.
 */
router.delete('/admin/:reportId', adminAuth, async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.reportId);
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    return res.json({ message: 'Report deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
