const express = require('express');
const { body } = require('express-validator');
const { query } = require('../db/pool');
const { validateRequest, authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('traffic_signal'));

const JUNCTION_SIGNALS = {
  north: { ns: true, ew: false },
  south: { ns: true, ew: false },
  east: { ns: false, ew: true },
  west: { ns: false, ew: true },
  north_east: { ns: true, ew: true },
  north_west: { ns: true, ew: true },
  south_east: { ns: true, ew: true },
  south_west: { ns: true, ew: true },
};

router.post('/register', [
  body('signal_id').notEmpty().trim().withMessage('Signal ID required'),
  body('name').notEmpty().trim().withMessage('Name required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('junction_type').optional().isIn(['four_way', 'three_way', 'roundabout']).withMessage('Invalid junction type'),
], validateRequest, async (req, res) => {
  try {
    const { signal_id, name, latitude, longitude, junction_type = 'four_way' } = req.body;
    
    const existing = await query('SELECT id FROM traffic_signals WHERE signal_id = $1', [signal_id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Signal ID already registered' });
    }
    
    const result = await query(
      `INSERT INTO traffic_signals (signal_id, name, latitude, longitude, junction_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [signal_id, name, latitude, longitude, junction_type]
    );
    
    res.status(201).json({ signal: result.rows[0] });
  } catch (error) {
    console.error('Register traffic signal error:', error);
    res.status(500).json({ error: 'Failed to register traffic signal' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const result = await query('SELECT * FROM traffic_signals WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Traffic signal not found' });
    }
    res.json({ signal: result.rows[0] });
  } catch (error) {
    console.error('Get traffic signal profile error:', error);
    res.status(500).json({ error: 'Failed to get traffic signal profile' });
  }
});

router.post('/ambulance-approach', [
  body('ambulance_id').isUUID().withMessage('Valid ambulance ID required'),
  body('direction').isIn(['north', 'south', 'east', 'west', 'north_east', 'north_west', 'south_east', 'south_west']).withMessage('Invalid direction'),
  body('distance_km').isFloat({ min: 0 }).withMessage('Valid distance required'),
], validateRequest, async (req, res) => {
  try {
    const { ambulance_id, direction, distance_km } = req.body;
    
    const signalResult = await query('SELECT * FROM traffic_signals WHERE user_id = $1', [req.user.id]);
    if (signalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Traffic signal not found' });
    }
    
    const signal = signalResult.rows[0];
    
    const signalConfig = JUNCTION_SIGNALS[direction] || { ns: false, ew: false };
    
    await query(
      `UPDATE traffic_signals SET north_south_green = $1, east_west_green = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [signalConfig.ns, signalConfig.ew, signal.id]
    );
    
    await query(
      `UPDATE ambulance_routes SET signal_activated = true WHERE ambulance_id = $1 AND signal_id = $2`,
      [ambulance_id, signal.id]
    );
    
    const io = req.app.get('io');
    io.to(`traffic_signal_${signal.id}`).emit('signal_changed', {
      signal_id: signal.signal_id,
      north_south_green: signalConfig.ns,
      east_west_green: signalConfig.ew,
      reason: 'ambulance_approach',
      ambulance_id,
      direction,
      distance_km
    });
    
    res.json({
      message: 'Signal updated for ambulance',
      signal: {
        signal_id: signal.signal_id,
        north_south_green: signalConfig.ns,
        east_west_green: signalConfig.ew
      }
    });
  } catch (error) {
    console.error('Ambulance approach error:', error);
    res.status(500).json({ error: 'Failed to process ambulance approach' });
  }
});

router.post('/ambulance-passed', [
  body('ambulance_id').isUUID().withMessage('Valid ambulance ID required'),
  body('direction').isIn(['north', 'south', 'east', 'west', 'north_east', 'north_west', 'south_east', 'south_west']).withMessage('Invalid direction'),
], validateRequest, async (req, res) => {
  try {
    const { ambulance_id, direction } = req.body;
    
    const signalResult = await query('SELECT * FROM traffic_signals WHERE user_id = $1', [req.user.id]);
    if (signalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Traffic signal not found' });
    }
    
    const signal = signalResult.rows[0];
    
    await query(
      `UPDATE ambulance_routes SET passed_signal = true WHERE ambulance_id = $1 AND signal_id = $2`,
      [ambulance_id, signal.id]
    );
    
    const hasOtherAmbulances = await query(
      `SELECT COUNT(*) FROM ambulance_routes ar
       JOIN ambulances a ON ar.ambulance_id = a.id
       WHERE ar.signal_id = $1 AND ar.passed_signal = false AND a.status IN ('en_route', 'engaged')`,
      [signal.id]
    );
    
    if (parseInt(hasOtherAmbulances.rows[0].count) === 0) {
      await query(
        `UPDATE traffic_signals SET north_south_green = true, east_west_green = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [signal.id]
      );
      
      const io = req.app.get('io');
      io.to(`traffic_signal_${signal.id}`).emit('signal_changed', {
        signal_id: signal.signal_id,
        north_south_green: true,
        east_west_green: false,
        reason: 'ambulance_passed'
      });
    }
    
    res.json({ message: 'Ambulance passed, signal reset if no other ambulances' });
  } catch (error) {
    console.error('Ambulance passed error:', error);
    res.status(500).json({ error: 'Failed to process ambulance passed' });
  }
});

router.get('/status', async (req, res) => {
  try {
    const result = await query('SELECT * FROM traffic_signals WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Traffic signal not found' });
    }
    
    const signal = result.rows[0];
    
    const activeRoutes = await query(
      `SELECT ar.*, a.vehicle_number, a.driver_name
       FROM ambulance_routes ar
       JOIN ambulances a ON ar.ambulance_id = a.id
       WHERE ar.signal_id = $1 AND ar.passed_signal = false
       ORDER BY ar.distance_to_signal ASC`,
      [signal.id]
    );
    
    res.json({
      signal: {
        signal_id: signal.signal_id,
        name: signal.name,
        junction_type: signal.junction_type,
        north_south_green: signal.north_south_green,
        east_west_green: signal.east_west_green,
        is_active: signal.is_active
      },
      approaching_ambulances: activeRoutes.rows
    });
  } catch (error) {
    console.error('Get signal status error:', error);
    res.status(500).json({ error: 'Failed to get signal status' });
  }
});

router.put('/manual-control', [
  body('north_south_green').isBoolean().withMessage('north_south_green must be boolean'),
  body('east_west_green').isBoolean().withMessage('east_west_green must be boolean'),
], validateRequest, async (req, res) => {
  try {
    const { north_south_green, east_west_green } = req.body;
    
    const result = await query(
      `UPDATE traffic_signals SET north_south_green = $1, east_west_green = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 RETURNING *`,
      [north_south_green, east_west_green, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Traffic signal not found' });
    }
    
    const io = req.app.get('io');
    io.to(`traffic_signal_${result.rows[0].id}`).emit('signal_changed', {
      signal_id: result.rows[0].signal_id,
      north_south_green,
      east_west_green,
      reason: 'manual_control'
    });
    
    res.json({ signal: result.rows[0] });
  } catch (error) {
    console.error('Manual control error:', error);
    res.status(500).json({ error: 'Failed to update signal manually' });
  }
});

module.exports = router;