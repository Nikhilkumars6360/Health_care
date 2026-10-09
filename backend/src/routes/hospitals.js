const express = require('express');
const { body } = require('express-validator');
const { query } = require('../db/pool');
const { validateRequest, authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('hospital'));

router.post('/register', [
  body('name').notEmpty().trim().withMessage('Hospital name required'),
  body('address').notEmpty().trim().withMessage('Address required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('license_number').optional().trim(),
  body('specialties').optional().isArray().withMessage('Specialties must be an array'),
], validateRequest, async (req, res) => {
  try {
    const existing = await query('SELECT id FROM hospitals WHERE user_id = $1', [req.user.id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Hospital already registered for this user' });
    }
    
    const { name, address, latitude, longitude, phone, email, license_number, specialties = [] } = req.body;
    
    const result = await query(
      `INSERT INTO hospitals (user_id, name, address, latitude, longitude, phone, email, license_number, specialties)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.id, name, address, latitude, longitude, phone, email, license_number, specialties]
    );
    
    res.status(201).json({ hospital: result.rows[0] });
  } catch (error) {
    console.error('Register hospital error:', error);
    res.status(500).json({ error: 'Failed to register hospital' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const result = await query('SELECT * FROM hospitals WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json({ hospital: result.rows[0] });
  } catch (error) {
    console.error('Get hospital profile error:', error);
    res.status(500).json({ error: 'Failed to get hospital profile' });
  }
});

router.put('/profile', [
  body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  body('address').optional().notEmpty().trim().withMessage('Address cannot be empty'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('specialties').optional().isArray().withMessage('Specialties must be an array'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
], validateRequest, async (req, res) => {
  try {
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    const allowedFields = ['name', 'address', 'latitude', 'longitude', 'phone', 'email', 'license_number', 'specialties', 'is_active'];
    
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
      `UPDATE hospitals SET ${updates.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    res.json({ hospital: result.rows[0] });
  } catch (error) {
    console.error('Update hospital profile error:', error);
    res.status(500).json({ error: 'Failed to update hospital profile' });
  }
});

router.get('/patients/search', [
  body('name').optional().trim(),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone'),
], validateRequest, async (req, res) => {
  try {
    const { name, phone } = req.query;
    
    let sql = `SELECT u.id, u.email, u.phone, up.first_name, up.last_name, up.blood_group, up.diseases, up.emergency_contact_name, up.emergency_contact_phone
               FROM users u
               LEFT JOIN user_profiles up ON u.id = up.user_id
               WHERE u.role = 'user'`;
    const params = [];
    let paramIndex = 1;
    
    if (name) {
      sql += ` AND (up.first_name ILIKE $${paramIndex} OR up.last_name ILIKE $${paramIndex})`;
      params.push(`%${name}%`);
      paramIndex++;
    }
    
    if (phone) {
      sql += ` AND u.phone ILIKE $${paramIndex}`;
      params.push(`%${phone}%`);
      paramIndex++;
    }
    
    sql += ' LIMIT 20';
    
    const result = await query(sql, params);
    res.json({ patients: result.rows });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({ error: 'Failed to search patients' });
  }
});

router.get('/patients/:userId', async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.phone, up.first_name, up.last_name, up.date_of_birth, up.blood_group, 
              up.emergency_contact_name, up.emergency_contact_phone, up.emergency_contact_relationship,
              up.diseases, up.allergies
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1 AND u.role = 'user'`,
      [req.params.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const medicationsResult = await query(
      'SELECT * FROM medications WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
      [req.params.userId]
    );
    
    const reportsResult = await query(
      'SELECT * FROM medical_reports WHERE user_id = $1 ORDER BY report_date DESC',
      [req.params.userId]
    );
    
    const appointmentsResult = await query(
      'SELECT * FROM appointments WHERE user_id = $1 AND hospital_id = $2 ORDER BY appointment_date DESC',
      [req.params.userId, req.user.id]
    );
    
    res.json({
      patient: result.rows[0],
      medications: medicationsResult.rows,
      reports: reportsResult.rows,
      appointments: appointmentsResult.rows
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({ error: 'Failed to get patient details' });
  }
});

router.post('/patients/:userId/medications', [
  body('name').notEmpty().trim().withMessage('Medication name required'),
  body('dosage').notEmpty().trim().withMessage('Dosage required'),
  body('frequency_per_day').isInt({ min: 1, max: 24 }).withMessage('Frequency must be 1-24'),
  body('times_per_day').isArray({ min: 1 }).withMessage('At least one time required'),
  body('start_date').isISO8601().withMessage('Valid start date required'),
  body('end_date').optional().isISO8601().withMessage('Invalid end date format'),
  body('instructions').optional().trim(),
  body('prescribed_by').optional().trim(),
], validateRequest, async (req, res) => {
  try {
    const { name, dosage, frequency_per_day, times_per_day, instructions, start_date, end_date, prescribed_by } = req.body;
    
    const result = await query(
      `INSERT INTO medications (user_id, name, dosage, frequency_per_day, times_per_day, instructions, start_date, end_date, prescribed_by, prescribed_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
       RETURNING *`,
      [req.params.userId, name, dosage, frequency_per_day, times_per_day, instructions, start_date, end_date, prescribed_by]
    );
    
    res.status(201).json({ medication: result.rows[0] });
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({ error: 'Failed to add medication' });
  }
});

router.post('/patients/:userId/reports', [
  body('title').notEmpty().trim().withMessage('Title required'),
  body('report_date').isISO8601().withMessage('Valid report date required'),
  body('description').optional().trim(),
  body('file_url').optional().isURL().withMessage('Invalid file URL'),
  body('file_type').optional().trim(),
  body('doctor_name').optional().trim(),
], validateRequest, async (req, res) => {
  try {
    const { title, description, file_url, file_type, report_date, doctor_name } = req.body;
    
    const result = await query(
      `INSERT INTO medical_reports (user_id, title, description, file_url, file_type, report_date, hospital_name, doctor_name)
       VALUES ($1, $2, $3, $4, $5, $6, (SELECT name FROM hospitals WHERE user_id = $7), $8)
       RETURNING *`,
      [req.params.userId, title, description, file_url, file_type, report_date, req.user.id, doctor_name]
    );
    
    res.status(201).json({ report: result.rows[0] });
  } catch (error) {
    console.error('Add report error:', error);
    res.status(500).json({ error: 'Failed to add report' });
  }
});

module.exports = router;