const express = require('express');
const { body } = require('express-validator');
const { query } = require('../db/pool');
const { validateRequest, authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    let sql, params;
    
    if (req.user.role === 'hospital') {
      sql = `SELECT a.*, u.email as user_email, u.phone as user_phone, up.first_name, up.last_name
             FROM appointments a
             JOIN users u ON a.user_id = u.id
             LEFT JOIN user_profiles up ON u.id = up.user_id
             WHERE a.hospital_id = $1
             ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      params = [req.user.id];
    } else {
      sql = `SELECT a.*, h.name as hospital_name, h.address as hospital_address
             FROM appointments a
             LEFT JOIN hospitals h ON a.hospital_id = h.id
             WHERE a.user_id = $1
             ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      params = [req.user.id];
    }
    
    const result = await query(sql, params);
    res.json({ appointments: result.rows });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let sql, params;
    
    if (req.user.role === 'hospital') {
      sql = `SELECT a.*, u.email as user_email, u.phone as user_phone, up.first_name, up.last_name, up.blood_group, up.diseases
             FROM appointments a
             JOIN users u ON a.user_id = u.id
             LEFT JOIN user_profiles up ON u.id = up.user_id
             WHERE a.id = $1 AND a.hospital_id = $2`;
      params = [req.params.id, req.user.id];
    } else {
      sql = `SELECT a.*, h.name as hospital_name, h.address as hospital_address, h.phone as hospital_phone
             FROM appointments a
             LEFT JOIN hospitals h ON a.hospital_id = h.id
             WHERE a.id = $1 AND a.user_id = $2`;
      params = [req.params.id, req.user.id];
    }
    
    const result = await query(sql, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ appointment: result.rows[0] });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to get appointment' });
  }
});

router.post('/', [
  body('hospital_id').isUUID().withMessage('Valid hospital ID required'),
  body('appointment_date').isISO8601().withMessage('Valid appointment date required'),
  body('appointment_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time required (HH:MM)'),
  body('reason').optional().trim(),
  body('doctor_name').optional().trim(),
], validateRequest, async (req, res) => {
  try {
    const { hospital_id, appointment_date, appointment_time, reason, doctor_name } = req.body;
    
    const hospitalCheck = await query('SELECT id FROM hospitals WHERE id = $1 AND is_active = true', [hospital_id]);
    if (hospitalCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found or inactive' });
    }
    
    const conflictCheck = await query(
      `SELECT id FROM appointments 
       WHERE hospital_id = $1 AND appointment_date = $2 AND appointment_time = $3 
       AND status NOT IN ('cancelled')`,
      [hospital_id, appointment_date, appointment_time]
    );
    
    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Time slot not available' });
    }
    
    const result = await query(
      `INSERT INTO appointments (user_id, hospital_id, appointment_date, appointment_time, reason, doctor_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, hospital_id, appointment_date, appointment_time, reason, doctor_name]
    );
    
    res.status(201).json({ appointment: result.rows[0] });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

router.put('/:id', [
  body('appointment_date').optional().isISO8601().withMessage('Invalid date format'),
  body('appointment_time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status'),
  body('reason').optional().trim(),
  body('doctor_name').optional().trim(),
  body('notes').optional().trim(),
], validateRequest, async (req, res) => {
  try {
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    const allowedFields = ['appointment_date', 'appointment_time', 'status', 'reason', 'doctor_name', 'notes'];
    
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
    
    let whereClause = 'WHERE id = $' + paramIndex;
    values.push(req.params.id);
    paramIndex++;
    
    if (req.user.role === 'hospital') {
      whereClause += ' AND hospital_id = $' + paramIndex;
      values.push(req.user.id);
    } else {
      whereClause += ' AND user_id = $' + paramIndex;
      values.push(req.user.id);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    const result = await query(
      `UPDATE appointments SET ${updates.join(', ')} ${whereClause} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized' });
    }
    
    res.json({ appointment: result.rows[0] });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let whereClause = 'WHERE id = $1';
    const params = [req.params.id];
    
    if (req.user.role === 'hospital') {
      whereClause += ' AND hospital_id = $2';
      params.push(req.user.id);
    } else {
      whereClause += ' AND user_id = $2';
      params.push(req.user.id);
    }
    
    const result = await query(
      `DELETE FROM appointments ${whereClause} RETURNING id`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

module.exports = router;