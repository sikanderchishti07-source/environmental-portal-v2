
const express    = require('express');
const router     = express.Router();
const Client     = require('../models/Client');
const adminAuth  = require('../middleware/adminAuth');

// ════════════════════════════════════════════════════════════
//  PUBLIC ROUTES (called by the frontend portal)
// ════════════════════════════════════════════════════════════

/**
 * POST /api/clients/validate
 * Validates a Client ID entered in the portal login.
 * Returns minimal client info — no sensitive data.
 *
 * Body: { clientId: "DIR-SAS-001" }
 */
router.post('/validate', async (req, res) => {
  try {
    const { clientId } = req.body;
    if (!clientId || typeof clientId !== 'string') {
      return res.status(400).json({ valid: false, message: 'Client ID is required.' });
    }

    const client = await Client.findOne({ clientId: clientId.trim().toUpperCase() });
    if (!client || !client.isActive) {
      return res.status(404).json({
        valid: false,
        message: 'Client ID not found. Please check and try again, or contact AECON.'
      });
    }

    // Record last login time
    client.lastLogin = new Date();
    await client.save();

    // Return only what the dashboard needs — not contact email etc.
    return res.json({
      valid: true,
      client: {
        clientId:    client.clientId,
        companyName: client.companyName,
        location:    client.location,
        industry:    client.industry,
        lastLogin:   client.lastLogin
      }
    });
  } catch (err) {
    console.error('[validate]', err);
    return res.status(500).json({ valid: false, message: 'Server error. Please try again.' });
  }
});


// ════════════════════════════════════════════════════════════
//  ADMIN ROUTES (require x-admin-key header)
// ════════════════════════════════════════════════════════════

/**
 * POST /api/clients
 * Create a new client with a permanently unique ID.
 * The ID is generated automatically — never supplied manually.
 *
 * Body: { companyName, contactName, contactEmail, contactPhone, location, industry, notes }
 */
router.post('/', adminAuth, async (req, res) => {
  try {
    const { companyName, contactName, contactEmail, contactPhone, location, industry, notes } = req.body;

    if (!companyName || !contactName || !contactEmail || !location) {
      return res.status(400).json({ error: 'companyName, contactName, contactEmail, and location are required.' });
    }

    // Build prefix  e.g. "Diriyah" + "Saudi Sasco" → "DIR-SAS"
    const prefix = Client.buildPrefix(location, companyName);

    // Find next sequential number for this prefix
    const seq = await Client.nextSequence(prefix);
    const clientId = `${prefix}-${String(seq).padStart(3, '0')}`;  // DIR-SAS-001

    const client = await Client.create({
      clientId,
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      location,
      industry: industry || 'other',
      notes
    });

    return res.status(201).json({
      message: `Client created successfully. Permanent ID: ${clientId}`,
      client
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A client with this ID already exists (race condition). Retry.' });
    }
    console.error('[POST /clients]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * GET /api/clients
 * List all clients (admin only).
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const clients = await Client.find({}).sort({ createdAt: -1 }).select('-__v');
    return res.json({ count: clients.length, clients });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * GET /api/clients/:clientId
 * Get a single client by ID (admin only, full data).
 */
router.get('/:clientId', adminAuth, async (req, res) => {
  try {
    const client = await Client.findOne({ clientId: req.params.clientId.toUpperCase() });
    if (!client) return res.status(404).json({ error: 'Client not found.' });
    return res.json(client);
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * PATCH /api/clients/:clientId
 * Update client details (admin only). ID itself is immutable.
 */
router.patch('/:clientId', adminAuth, async (req, res) => {
  try {
    const { clientId, ...updates } = req.body;  // strip clientId — never change it
    const client = await Client.findOneAndUpdate(
      { clientId: req.params.clientId.toUpperCase() },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ error: 'Client not found.' });
    return res.json({ message: 'Updated.', client });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * DELETE /api/clients/:clientId
 * Soft-delete (sets isActive: false). Hard delete is intentionally not exposed.
 */
router.delete('/:clientId', adminAuth, async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { clientId: req.params.clientId.toUpperCase() },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!client) return res.status(404).json({ error: 'Client not found.' });
    return res.json({ message: `Client ${client.clientId} deactivated.` });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
