import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = ['admin', 'investigator', 'actor'].includes(role) ? role : 'investigator';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: userRole
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'trust_graph_super_secret_jwt_key_2026_demo',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'trust_graph_super_secret_jwt_key_2026_demo',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (err) {
    next(err);
  }
}
