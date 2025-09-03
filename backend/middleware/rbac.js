const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

const checkSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

module.exports = {
  checkRole,
  checkAdmin,
  checkSuperAdmin,
};