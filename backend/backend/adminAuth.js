// ────────────────────────────────────────────────────────────
//  Admin Authentication Middleware
//  All admin routes require this header:
//    x-admin-key: <your ADMIN_API_KEY from .env>
//  Never expose this key in the frontend.
// ────────────────────────────────────────────────────────────

module.exports = function adminAuth(req, res, next) {
  const provided = req.headers['x-admin-key'];
  const expected = process.env.ADMIN_API_KEY;

  if (!expected) {
    return res.status(500).json({ error: 'Server misconfiguration: ADMIN_API_KEY not set.' });
  }
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized. Valid x-admin-key header required.' });
  }
  next();
};
