const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, teamId } = req.body;

    console.log('Signup request:', { name, email, role, teamId });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Team is required for non-admin roles
    if (role !== 'admin' && !teamId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a team'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user (teamId can be null for admin)
    const newUser = await User.create({ 
      name, 
      email, 
      password, 
      role, 
      teamId: teamId || null 
    });
    
    // Generate token
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          roles: newUser.roles,
          team: newUser.team,
          teams: newUser.teams
        },
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Signin endpoint
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.roles ? user.roles[0] : null,
          roles: user.roles
        },
        token
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get roles and teams for registration form
router.get('/form-data', async (req, res) => {
  try {
    const [roles, teams] = await Promise.all([
      User.getRoles(),
      User.getMaintenanceTeams()
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        roles,
        teams
      }
    });
  } catch (error) {
    console.error('Get form data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form data'
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;