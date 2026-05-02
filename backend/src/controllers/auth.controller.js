const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(password);
    // Only allow CUSTOMER or ORGANIZER via self-registration; ADMIN must be assigned directly in DB
    const allowedRoles = ['CUSTOMER', 'ORGANIZER'];
    const userRole = allowedRoles.includes(role) ? role : 'CUSTOMER';
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole
      }
    });

    if (userRole === 'ORGANIZER') {
      await prisma.organizer.create({
        data: {
          userId: user.id,
          businessName: req.body.businessName || `${name}'s Business`
        }
      });
    }

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ error: 'User account is blocked' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
