/**
 * Restricts a route to specific user roles.
 * Usage: router.get('/', protect, authorize('collector', 'admin'), handler)
 */
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, no user found on request.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not permitted to access this resource.`,
      });
    }
    next();
  };
};