const express = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const { query } = require('../db/pool');
const { validateRequest, generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').isMobilePhone('any').withMessage('Valid phone number required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['user', 'hospital', 'ambulance_driver', 'traffic_signal']).withMessage('Invalid role'),
], validateRequest, async (req, res) => {
  try {
    const { email, phone, password, role = 'user' } = req.body;
    
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email or phone already registered' });
    }
    
    const passwordHash = await bcrypt.hash(password, 12);
    
    const result = await query(
      `INSERT INTO users (email, phone, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, phone, role, created_at`,
      [email, phone, passwordHash, role]
    );
    
    const user = result.rows[0];
    const token = generateToken(user.id, user.role);
    
    res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, email: user.email, phone: user.phone, role: user.role },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await query(
      'SELECT id, email, phone, password_hash, role FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id, user.role);
    
    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, phone: user.phone, role: user.role },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, phone, role, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.post('/refresh', authenticateToken, (req, res) => {
  const token = generateToken(req.user.id, req.user.role);
  res.json({ token });
});

module.exports = router;