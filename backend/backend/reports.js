const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const Report     = require('../models/Report');
const Client     = require('../models/Client');
const adminAuth  = require('../middleware/adminAuth');

// ── Cloudinary config ────────────────────────────────────────
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ── File upload config (memory storage for Cloudinary) ───────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|jpg|jpeg|png|gif|webp/;
  const ext     = file.originalname.split('.').pop().toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error(`File type .${ext} is not allowed.`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ── Helper: Upload buffer to Cloudinary ──────────────────────
function uploadToCloudinary(fileBuffer, folder, resourceType = 'auto') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `aecon/${folder}`, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

// ════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ════════════════════════════════════════════════════════════

router.get('/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId.toUpperCase();
    const client = await Client.findOne({ clientId, isActive: true });
    if (!client) return res.status(404).json({ error: 'Invalid Client ID.' });

    const reports = await Report.find({ clientId, isPublished: true })
      .sort({ serviceDate: -1 })
      .select('-__v -uploadedBy');

    return res.json({ clientId, companyName: client.companyName, count: reports.length, reports });
  } catch (err) {
    console.error('[GET /reports/:clientId]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// ════════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ════════════════════════════════════════════════════════════

router.post('/:clientId', adminAuth, upload.fields([
  { name: 'pdfReport', maxCount: 1 },
  { name: 'stationImages', maxCount: 10 },
  { name: 'noiseImages', maxCount: 10 },
  { name: 'coordinateImages', maxCount: 10 },
  { name: 'otherFiles', maxCount: 5 }
]), async (req, res) => {
  try {
    const clientId = req.params.clientId.toUpperCase();
    const client = await Client.findOne({ clientId, isActive: true });
    if (!client) return res.status(404).json({ error: 'Client ID not found.' });

    const { reportTitle, reportType, serviceDate, reportDate, location, projectRef, summary, complianceStandard, overallStatus, isPublished } = req.body;

    if (!reportTitle || !reportType || !serviceDate || !reportDate || !location) {
      return res.status(400).json({ error: 'reportTitle, reportType, serviceDate, reportDate, and location are required.' });
    }

    const m = req.body.measurements || {};
    const measurements = {};
    ['pm25', 'pm10', 'no2', 'so2', 'co', 'noise'].forEach(key => {
      if (m[key] !== undefined) {
        measurements[key] = { value: parseFloat(m[key]), status: m[`${key}_status`] || 'pending' };
      }
    });

    // Upload files to Cloudinary
    const files = {};
    
    if (req.files?.pdfReport?.[0]) {
      console.log('Uploading PDF to Cloudinary...');
      files.pdfReport = await uploadToCloudinary(req.files.pdfReport[0].buffer, `${clientId}/reports`, 'raw');
    }
    if (req.files?.stationImages) {
      console.log('Uploading station images...');
      files.stationImages = await Promise.all(req.files.stationImages.map(f => uploadToCloudinary(f.buffer, `${clientId}/images`)));
    }
    if (req.files?.noiseImages) {
      console.log('Uploading noise images...');
      files.noiseImages = await Promise.all(req.files.noiseImages.map(f => uploadToCloudinary(f.buffer, `${clientId}/images`)));
    }
    if (req.files?.coordinateImages) {
      console.log('Uploading coordinate images...');
      files.coordinateImages = await Promise.all(req.files.coordinateImages.map(f => uploadToCloudinary(f.buffer, `${clientId}/images`)));
    }
    if (req.files?.otherFiles) {
      console.log('Uploading other files...');
      files.otherFiles = await Promise.all(req.files.otherFiles.map(f => uploadToCloudinary(f.buffer, `${clientId}/other`, 'raw')));
    }

    const report = await Report.create({
      clientId, reportTitle, reportType,
      serviceDate: new Date(serviceDate),
      reportDate: new Date(reportDate),
      location, projectRef, summary,
      complianceStandard: complianceStandard || 'NCEC SAAQS',
      overallStatus: overallStatus || 'pending',
      measurements, files,
      isPublished: isPublished === 'true' || isPublished === true,
      uploadedBy: 'admin'
    });

    console.log('Report created with Cloudinary URLs:', files);
    return res.status(201).json({ message: 'Report created successfully.', report });
  } catch (err) {
    console.error('[POST /reports/:clientId]', err);
    return res.status(500).json({ error: err.message || 'Server error.' });
  }
});

router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 }).select('-__v');
    return res.json({ count: reports.length, reports });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

router.patch('/admin/:reportId', adminAuth, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.reportId, { $set: req.body }, { new: true, runValidators: true });
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    return res.json({ message: 'Updated.', report });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

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
