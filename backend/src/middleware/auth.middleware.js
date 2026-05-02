const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized, invalid or expired token' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, status: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized, user not found' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ error: 'Forbidden, user is blocked' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden, insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
