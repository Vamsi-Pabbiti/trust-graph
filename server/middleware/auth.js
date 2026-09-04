import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trust_graph_super_secret_jwt_key_2026_demo');
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Invalid token or inactive user account.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token expired or invalid.' });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden. Role '${req.user ? req.user.role : 'none'}' does not have permission to perform this action.` 
      });
    }
    next();
  };
}
