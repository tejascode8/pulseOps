import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from Bearer <token>
      token = req.headers.authorization.split(' ')[1];

      if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ success: false, error: 'Not authorized, token missing' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pulseops_fallback_secret_jwt_2026');

      // Get user from token payload (exclude password)
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, error: 'User account not found' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.warn('[Auth Middleware] Invalid token error:', error.message);
      return res.status(401).json({ success: false, error: 'Not authorized, session token expired or invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, please sign in' });
  }
}
