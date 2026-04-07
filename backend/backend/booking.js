const mongoose = require('mongoose');

// ────────────────────────────────────────────────────────────
//  Booking Schema
//  Stores appointment requests for site inspections
// ────────────────────────────────────────────────────────────
const BookingSchema = new mongoose.Schema(
  {
    // Booking Reference (auto-generated)
    bookingRef: {
      type: String,
      unique: true
    },

    // Client Info (can be existing client or new inquiry)
    clientId: {
      type: String,
      trim: true,
      uppercase: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    contactName: {
      type: String,
      required: true,
      trim: true
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true
    },

    // Service Details
    serviceType: {
      type: String,
      required: true,
      enum: ['ambient_air', 'indoor_air', 'noise', 'water', 'soil', 'stack_emission', 'environmental_audit', 'other']
    },
    serviceDescription: {
      type: String,
      trim: true
    },

    // Location
    siteLocation: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },

    // Appointment Date & Time
    preferredDate: {
      type: Date,
      required: true
    },
    preferredTime: {
      type: String,
      required: true,
      enum: ['morning', 'afternoon', 'evening', 'flexible']
    },
    alternateDate: {
      type: Date
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'pending'
    },

    // Admin Notes
    adminNotes: {
      type: String,
      trim: true
    },

    // Confirmed Date (set by admin)
    confirmedDate: {
      type: Date
    },
    confirmedTime: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate booking reference before save
BookingSchema.pre('save', async function(next) {
  if (!this.bookingRef) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await mongoose.model('Booking').countDocuments() + 1;
    this.bookingRef = `BK${year}${month}-${count.toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
