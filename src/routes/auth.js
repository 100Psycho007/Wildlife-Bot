const express = require('express');
const User = require('../models/User');
const { 
  generateAccessToken, 
  generateRefreshToken,
  verifyToken,
  rateLimitAuth 
} = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Login endpoint
 */
router.post('/login', rateLimitAuth, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      logger.warn('Failed login attempt - user not found', { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password using bcrypt
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      logger.warn('Failed login attempt - invalid password', { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info('User logged in', { userId: user._id, role: user.role });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Refresh token endpoint
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = require('jsonwebtoken').verify(
      refreshToken, 
      process.env.JWT_SECRET || 'wildlife-demo-secret-change-in-production'
    );

    if (decoded.type !== 'refresh') {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    logger.error('Token refresh error', { error: error.message });
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

/**
 * Get current user info
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Get user error', { error: error.message });
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;
