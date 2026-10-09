const express = require('express');
const { body } = require('express-validator');
const { query } = require('../db/pool');
const { validateRequest, authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM medical_reports WHERE user_id = $1 ORDER BY report_date DESC, created_at DESC',
      [req.user.id]
    );
    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM medical_reports WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ report: result.rows[0] });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to get report' });
  }
});

router.post('/', [
  body('title').notEmpty().trim().withMessage('Title required'),
  body('report_date').isISO8601().withMessage('Valid report date required'),
  body('description').optional().trim(),
  body('file_url').optional().isURL().withMessage('Invalid file URL'),
  body('file_type').optional().trim(),
  body('hospital_name').optional().trim(),
  body('doctor_name').optional().trim(),
], validateRequest, async (req, res) => {
  try {
    const { title, description, file_url, file_type, report_date, hospital_name, doctor_name } = req.body;
    
    const result = await query(
      `INSERT INTO medical_reports 
       (user_id, title, description, file_url, file_type, report_date, hospital_name, doctor_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, title, description, file_url, file_type, report_date, hospital_name, doctor_name]
    );
    
    res.status(201).json({ report: result.rows[0] });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

router.put('/:id', [
  body('title').optional().notEmpty().trim().withMessage('Title cannot be empty'),
  body('report_date').optional().isISO8601().withMessage('Invalid report date format'),
  body('file_url').optional().isURL().withMessage('Invalid file URL'),
], validateRequest, async (req, res) => {
  try {
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    const allowedFields = ['title', 'description', 'file_url', 'file_type', 'report_date', 'hospital_name', 'doctor_name'];
    
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
      `UPDATE medical_reports SET ${updates.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ report: result.rows[0] });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM medical_reports WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

module.exports = router;