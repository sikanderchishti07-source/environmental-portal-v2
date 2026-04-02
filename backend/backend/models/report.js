const mongoose = require('mongoose');

// ────────────────────────────────────────────────────────────
//  Report Schema
//  Each report is linked to one clientId (permanent).
//  Admin creates reports; clients only ever read them.
// ────────────────────────────────────────────────────────────
const ReportSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true   // fast lookups by clientId
    },

    // ── Core metadata ──────────────────────────────────────
    reportTitle:    { type: String, required: true, trim: true },
    reportType: {
      type: String,
      enum: ['ambient_air', 'stack_emission', 'indoor_air', 'eia', 'water_soil', 'emp', 'noise', 'other'],
      required: true
    },
    serviceDate:    { type: Date, required: true },
    reportDate:     { type: Date, required: true },  // date report was issued
    location:       { type: String, required: true, trim: true },
    projectRef:     { type: String, trim: true },   // e.g. AQ-2025-001

    // ── Measurements summary (optional key values) ─────────
    measurements: {
      pm25:   { value: Number, unit: { type: String, default: 'µg/m³' }, status: String },
      pm10:   { value: Number, unit: { type: String, default: 'µg/m³' }, status: String },
      no2:    { value: Number, unit: { type: String, default: 'µg/m³' }, status: String },
      so2:    { value: Number, unit: { type: String, default: 'µg/m³' }, status: String },
      co:     { value: Number, unit: { type: String, default: 'µg/m³' }, status: String },
      noise:  { value: Number, unit: { type: String, default: 'dB(A)'  }, status: String }
    },

    // ── Compliance ─────────────────────────────────────────
    complianceStandard: { type: String, default: 'NCEC SAAQS' },
    overallStatus: {
      type: String,
      enum: ['compliant', 'exceedance', 'marginal', 'pending'],
      default: 'pending'
    },
    summary:   { type: String, trim: true },

    // ── Files ─────────────────────────────────────────────
    // Stored as relative paths under /uploads/  OR  public URLs
    files: {
      pdfReport:         { type: String },  // path to final PDF
      stationImages:     [{ type: String }],
      noiseImages:       [{ type: String }],
      coordinateImages:  [{ type: String }],
      otherFiles:        [{ type: String }]
    },

    // ── Meta ───────────────────────────────────────────────
    isPublished:   { type: Boolean, default: false },  // admin toggles this to make visible
    uploadedBy:    { type: String, default: 'admin' }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', ReportSchema);
