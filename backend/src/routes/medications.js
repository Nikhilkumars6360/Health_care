const express = require('express');
const { body } = require('express-validator');
const { query } = require('../db/pool');
const { validateRequest, authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { active_only } = req.query;
    let sql = 'SELECT * FROM medications WHERE user_id = $1';
    const params = [req.user.id];
    
    if (active_only === 'true') {
      sql += ' AND is_active = true';
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await query(sql, params);
    res.json({ medications: result.rows });
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ error: 'Failed to get medications' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM medications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json({ medication: result.rows[0] });
  } catch (error) {
    console.error('Get medication error:', error);
    res.status(500).json({ error: 'Failed to get medication' });
  }
});

router.post('/', [
  body('name').notEmpty().trim().withMessage('Medication name required'),
  body('dosage').notEmpty().trim().withMessage('Dosage required'),
  body('frequency_per_day').isInt({ min: 1, max: 24 }).withMessage('Frequency must be 1-24'),
  body('times_per_day').isArray({ min: 1 }).withMessage('At least one time required'),
  body('start_date').isISO8601().withMessage('Valid start date required'),
  body('end_date').optional().isISO8601().withMessage('Invalid end date format'),
  body('instructions').optional().trim(),
  body('prescribed_by').optional().trim(),
  body('prescribed_date').optional().isISO8601().withMessage('Invalid prescribed date format'),
], validateRequest, async (req, res) => {
  try {
    const {
      name, dosage, frequency_per_day, times_per_day, instructions,
      start_date, end_date, prescribed_by, prescribed_date
    } = req.body;
    
    const result = await query(
      `INSERT INTO medications 
       (user_id, name, dosage, frequency_per_day, times_per_day, instructions, 
        start_date, end_date, prescribed_by, prescribed_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.id, name, dosage, frequency_per_day, times_per_day, instructions,
       start_date, end_date, prescribed_by, prescribed_date]
    );
    
    res.status(201).json({ medication: result.rows[0] });
  } catch (error) {
    console.error('Create medication error:', error);
    res.status(500).json({ error: 'Failed to create medication' });
  }
});

router.put('/:id', [
  body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  body('dosage').optional().notEmpty().trim().withMessage('Dosage cannot be empty'),
  body('frequency_per_day').optional().isInt({ min: 1, max: 24 }).withMessage('Frequency must be 1-24'),
  body('times_per_day').optional().isArray({ min: 1 }).withMessage('At least one time required'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
  body('end_date').optional().isISO8601().withMessage('Invalid end date format'),
], validateRequest, async (req, res) => {
  try {
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    const allowedFields = [
      'name', 'dosage', 'frequency_per_day', 'times_per_day', 'instructions',
      'start_date', 'end_date', 'is_active', 'prescribed_by', 'prescribed_date'
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
    values.push(req.params.id);
    values.push(req.user.id);
    
    const result = await query(
      `UPDATE medications SET ${updates.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json({ medication: result.rows[0] });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM medications WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ error: 'Failed to delete medication' });
  }
});

module.exports = router;