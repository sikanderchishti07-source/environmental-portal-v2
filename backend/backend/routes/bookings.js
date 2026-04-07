const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const adminAuth = require('../middleware/adminAuth');

// ════════════════════════════════════════════════════════════
//  PUBLIC ROUTES (for website booking form)
// ════════════════════════════════════════════════════════════

/**
 * POST /api/bookings
 * Create a new booking request (from website)
 */
router.post('/', async (req, res) => {
  try {
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      serviceType,
      serviceDescription,
      siteLocation,
      city,
      preferredDate,
      preferredTime,
      alternateDate,
      clientId
    } = req.body;

    // Validation
    if (!companyName || !contactName || !contactEmail || !contactPhone) {
      return res.status(400).json({ error: 'Company name, contact name, email, and phone are required.' });
    }
    if (!serviceType || !siteLocation || !city) {
      return res.status(400).json({ error: 'Service type, site location, and city are required.' });
    }
    if (!preferredDate || !preferredTime) {
      return res.status(400).json({ error: 'Preferred date and time are required.' });
    }

    // Check if date is in the future
    const bookingDate = new Date(preferredDate);
    if (bookingDate < new Date()) {
      return res.status(400).json({ error: 'Preferred date must be in the future.' });
    }

    const booking = await Booking.create({
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      serviceType,
      serviceDescription,
      siteLocation,
      city,
      preferredDate: bookingDate,
      preferredTime,
      alternateDate: alternateDate ? new Date(alternateDate) : null,
      clientId: clientId || null,
      status: 'pending'
    });

    console.log('[NEW BOOKING]', booking.bookingRef, '-', companyName);

    return res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully!',
      booking: {
        bookingRef: booking.bookingRef,
        companyName: booking.companyName,
        serviceType: booking.serviceType,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        status: booking.status
      }
    });

  } catch (err) {
    console.error('[POST /bookings]', err);
    return res.status(500).json({ error: err.message || 'Server error.' });
  }
});

/**
 * GET /api/bookings/check/:bookingRef
 * Check booking status by reference number
 */
router.get('/check/:bookingRef', async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      bookingRef: req.params.bookingRef.toUpperCase() 
    }).select('-adminNotes -__v');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    return res.json({ booking });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});


// ════════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ════════════════════════════════════════════════════════════

/**
 * GET /api/bookings/admin/all
 * Get all bookings (admin only)
 */
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .select('-__v');
    
    return res.json({ 
      count: bookings.length, 
      bookings 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * GET /api/bookings/admin/pending
 * Get pending bookings (admin only)
 */
router.get('/admin/pending', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .sort({ preferredDate: 1 })
      .select('-__v');
    
    return res.json({ 
      count: bookings.length, 
      bookings 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * PATCH /api/bookings/admin/:bookingId
 * Update booking status or details (admin only)
 */
router.patch('/admin/:bookingId', adminAuth, async (req, res) => {
  try {
    const { status, adminNotes, confirmedDate, confirmedTime } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (confirmedDate) updateData.confirmedDate = new Date(confirmedDate);
    if (confirmedTime) updateData.confirmedTime = confirmedTime;

    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    console.log('[BOOKING UPDATED]', booking.bookingRef, '- Status:', booking.status);

    return res.json({ 
      message: 'Booking updated.', 
      booking 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * DELETE /api/bookings/admin/:bookingId
 * Delete a booking (admin only)
 */
router.delete('/admin/:bookingId', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    console.log('[BOOKING DELETED]', booking.bookingRef);

    return res.json({ message: 'Booking deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
