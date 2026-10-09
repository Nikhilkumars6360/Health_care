const express = require('express');
const { body } = require('express-validator');
const { query } = require('../db/pool');
const { validateRequest, authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT up.*, u.email, u.phone 
       FROM user_profiles up 
       JOIN users u ON up.user_id = u.id 
       WHERE up.user_id = $1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.post('/', [
  body('first_name').notEmpty().trim().withMessage('First name required'),
  body('last_name').notEmpty().trim().withMessage('Last name required'),
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date format'),
  body('blood_group').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  body('emergency_contact_name').optional().trim(),
  body('emergency_contact_phone').optional().isMobilePhone('any').withMessage('Invalid emergency contact phone'),
  body('emergency_contact_relationship').optional().trim(),
  body('diseases').optional().isArray().withMessage('Diseases must be an array'),
  body('allergies').optional().isArray().withMessage('Allergies must be an array'),
], validateRequest, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      blood_group,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      diseases = [],
      allergies = [],
    } = req.body;
    
    const existing = await query('SELECT id FROM user_profiles WHERE user_id = $1', [req.user.id]);
    
    let result;
    if (existing.rows.length > 0) {
      result = await query(
        `UPDATE user_profiles SET 
          first_name = $1, last_name = $2, date_of_birth = $3, blood_group = $4,
          emergency_contact_name = $5, emergency_contact_phone = $6, 
          emergency_contact_relationship = $7, diseases = $8, allergies = $9,
          updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $10
         RETURNING *`,
        [first_name, last_name, date_of_birth, blood_group, emergency_contact_name,
         emergency_contact_phone, emergency_contact_relationship, diseases, allergies, req.user.id]
      );
    } else {
      result = await query(
        `INSERT INTO user_profiles 
         (user_id, first_name, last_name, date_of_birth, blood_group, 
          emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, 
          diseases, allergies)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [req.user.id, first_name, last_name, date_of_birth, blood_group,
         emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
         diseases, allergies]
      );
    }
    
    res.status(existing.rows.length > 0 ? 200 : 201).json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Create/Update profile error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

router.put('/', [
  body('first_name').optional().notEmpty().trim().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().trim().withMessage('Last name cannot be empty'),
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date format'),
  body('blood_group').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  body('emergency_contact_phone').optional().isMobilePhone('any').withMessage('Invalid emergency contact phone'),
  body('diseases').optional().isArray().withMessage('Diseases must be an array'),
  body('allergies').optional().isArray().withMessage('Allergies must be an array'),
], validateRequest, async (req, res) => {
  try {
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    const allowedFields = [
      'first_name', 'last_name', 'date_of_birth', 'blood_group',
      'emergency_contact_name', 'emergency_contact_phone', 
      'emergency_contact_relationship', 'diseases', 'allergies'
    ];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(req.body[field]);
        paramIndex++;
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user.id);
    
    const result = await query(
      `UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;