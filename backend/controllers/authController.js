import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Helper to generate signed JWT Token
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pulseops_fallback_secret_jwt_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
}

// POST /api/auth/register - Register a new user (Free forever & encrypted)
export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide full name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    // Create user in MongoDB with bcrypt hashed password
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim(),
    });

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error during registration' });
  }
}

// POST /api/auth/login - Authenticate user & get JWT token
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter both email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user and explicitly select password hash
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email address or password' });
    }

    // Verify bcrypt password hash
    const isMatch = await user.matchPassword(password.trim());
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email address or password' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Sign in successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error during sign in' });
  }
}

// GET /api/auth/me - Get current logged-in user profile (Protected)
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
