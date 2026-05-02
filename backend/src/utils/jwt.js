const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = '1d') => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'supersecret_jwt_key', {
    expiresIn,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'supersecret_jwt_key');
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
