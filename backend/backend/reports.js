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

// ── Resend Email config ──────────────────────────────────────
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

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

// ── Helper: Send email notification to client ────────────────
async function sendReportNotification(client, report, pdfUrl) {
  try {
    const portalUrl = 'https://environmental-portal-v2.vercel.app';
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f0f4f8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg, #0f3d3e 0%, #1a5c5e 100%); border-radius:16px 16px 0 0; padding:32px; text-align:center;">
      <div style="display:inline-block; width:50px; height:50px; background:linear-gradient(135deg, #c9a227, #e8c547); border-radius:12px; line-height:50px; font-size:24px; font-weight:bold; color:#0f3d3e;">A</div>
      <h1 style="color:white; margin:16px 0 0 0; font-size:24px; font-weight:700;">AECON Portal</h1>
      <p style="color:rgba(255,255,255,0.7); margin:4px 0 0 0; font-size:14px;">Environmental Consultancy</p>
    </div>
    
    <!-- Body -->
    <div style="background:white; padding:32px; border-radius:0 0 16px 16px; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
      
      <h2 style="color:#1e293b; margin:0 0 8px 0; font-size:20px;">New Report Available!</h2>
      <p style="color:#64748b; margin:0 0 24px 0; font-size:15px; line-height:1.6;">
        Hello <strong>${client.contactName}</strong>,<br>
        A new environmental report has been uploaded to your portal.
      </p>
      
      <!-- Report Card -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:24px;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0; color:#64748b; font-size:13px; width:120px;">Report Title</td>
            <td style="padding:8px 0; color:#1e293b; font-size:14px; font-weight:600;">${report.reportTitle}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#64748b; font-size:13px;">Report Type</td>
            <td style="padding:8px 0; color:#1e293b; font-size:14px;">${report.reportType}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#64748b; font-size:13px;">Location</td>
            <td style="padding:8px 0; color:#1e293b; font-size:14px;">${report.location}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#64748b; font-size:13px;">Date</td>
            <td style="padding:8px 0; color:#1e293b; font-size:14px;">${new Date(report.reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
        </table>
      </div>
      
      <!-- CTA Buttons -->
      <div style="text-align:center;">
        ${pdfUrl ? `<a href="${pdfUrl}" style="display:inline-block; background:linear-gradient(135deg, #0f3d3e, #1a5758); color:white; text-decoration:none; padding:14px 28px; border-radius:10px; font-weight:600; font-size:14px; margin-right:12px;">Download PDF</a>` : ''}
        <a href="${portalUrl}" style="display:inline-block; background:#f1f5f9; color:#475569; text-decoration:none; padding:14px 28px; border-radius:10px; font-weight:600; font-size:14px;">Open Portal</a>
      </div>
      
      <hr style="border:none; border-top:1px solid #e2e8f0; margin:32px 0;">
      
      <p style="color:#94a3b8; font-size:12px; margin:0; text-align:center;">
        Your Client ID: <strong style="color:#64748b;">${client.clientId}</strong><br>
        Use this ID to login to your portal.
      </p>
      
    </div>
    
    <!-- Footer -->
    <div style="text-align:center; padding:24px;">
      <p style="color:#94a3b8; font-size:12px; margin:0;">
        AECON - Alemad Alarabi Environmental Consultancy<br>
        Riyadh, Saudi Arabia | +966 50 336 1798<br>
        <a href="mailto:enviro@aecon-sa.com" style="color:#0f3d3e;">enviro@aecon-sa.com</a>
      </p>
    </div>
    
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'AECON Portal <onboarding@resend.dev>',
      to: client.contactEmail,
      subject: `New Report Available: ${report.reportTitle}`,
      html: emailHtml
    });

    if (error) {
      console.error('[EMAIL ERROR]', error);
      return { success: false, error };
    }

    console.log('[EMAIL SENT]', data);
    return { success: true, data };
    
  } catch (err) {
    console.error('[EMAIL EXCEPTION]', err);
    return { success: false, error: err.message };
  }
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

    // ── Send Email Notification ──────────────────────────────
    if (report.isPublished && client.contactEmail) {
      console.log('Sending email notification to:', client.contactEmail);
      const emailResult = await sendReportNotification(client, report, files.pdfReport);
      
      return res.status(201).json({ 
        message: 'Report created successfully.', 
        report,
        emailSent: emailResult.success,
        emailTo: client.contactEmail
      });
    }

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
