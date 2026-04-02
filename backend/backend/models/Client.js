
const mongoose = require('mongoose');

// ────────────────────────────────────────────────────────────
//  Client Schema
//  Each client gets ONE permanent unique ID, e.g. DIR-SAS-001
//  Created ONCE by admin — never regenerated.
// ────────────────────────────────────────────────────────────
const ClientSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      // Format: LOC-CO-NNN  e.g. DIR-SAS-001 / RIY-CEM-002
      match: [/^[A-Z]{2,6}-[A-Z]{2,6}-\d{3}$/, 'Invalid Client ID format (e.g. DIR-SAS-001)']
    },
    companyName:  { type: String, required: true, trim: true },
    contactName:  { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    location:     { type: String, required: true, trim: true },
    industry:     {
      type: String,
      enum: ['cement', 'power', 'oil_gas', 'construction', 'food', 'pharma', 'government', 'mega_dev', 'other'],
      default: 'other'
    },
    notes:        { type: String, trim: true },
    isActive:     { type: Boolean, default: true },
    lastLogin:    { type: Date }
  },
  {
    timestamps: true   // adds createdAt & updatedAt automatically
  }
);

// Helper: given location + company strings, build the ID prefix
// e.g. "Diriyah" + "Saudi Sasco" → "DIR-SAS"
ClientSchema.statics.buildPrefix = function (location, companyName) {
  const loc = location
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3);
  const co = companyName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3);
  return `${loc}-${co}`;
};

// Helper: find next sequential number for a prefix
ClientSchema.statics.nextSequence = async function (prefix) {
  const existing = await this.find(
    { clientId: new RegExp('^' + prefix + '-') },
    { clientId: 1 }
  ).sort({ clientId: -1 }).limit(1);

  if (!existing.length) return 1;

  const last = existing[0].clientId; // e.g. DIR-SAS-004
  const num  = parseInt(last.split('-').pop(), 10);
  return num + 1;
};

module.exports = mongoose.model('Client', ClientSchema);
