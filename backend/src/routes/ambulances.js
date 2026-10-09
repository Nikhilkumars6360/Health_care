const express = require('express');
const { body } = require('express-validator');
const { query } = require('../db/pool');
const { validateRequest, authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('ambulance_driver'));

router.post('/register', [
  body('driver_name').notEmpty().trim().withMessage('Driver name required'),
  body('driver_phone').isMobilePhone('any').withMessage('Valid driver phone required'),
  body('vehicle_number').notEmpty().trim().withMessage('Vehicle number required'),
  body('vehicle_type').isIn(['basic', 'advanced', 'icu']).withMessage('Invalid vehicle type'),
], validateRequest, async (req, res) => {
  try {
    const existing = await query('SELECT id FROM ambulances WHERE user_id = $1', [req.user.id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ambulance already registered for this user' });
    }
    
    const { driver_name, driver_phone, vehicle_number, vehicle_type } = req.body;
    
    const vehicleCheck = await query('SELECT id FROM ambulances WHERE vehicle_number = $1', [vehicle_number]);
    if (vehicleCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Vehicle number already registered' });
    }
    
    const result = await query(
      `INSERT INTO ambulances (user_id, driver_name, driver_phone, vehicle_number, vehicle_type, status)
       VALUES ($1, $2, $3, $4, $5, 'available')
       RETURNING *`,
      [req.user.id, driver_name, driver_phone, vehicle_number, vehicle_type]
    );
    
    res.status(201).json({ ambulance: result.rows[0] });
  } catch (error) {
    console.error('Register ambulance error:', error);
    res.status(500).json({ error: 'Failed to register ambulance' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const result = await query('SELECT * FROM ambulances WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ambulance not found' });
    }
    res.json({ ambulance: result.rows[0] });
  } catch (error) {
    console.error('Get ambulance profile error:', error);
    res.status(500).json({ error: 'Failed to get ambulance profile' });
  }
});

router.put('/location', [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
], validateRequest, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    const result = await query(
      `UPDATE ambulances SET latitude = $1, longitude = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 RETURNING *`,
      [latitude, longitude, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ambulance not found' });
    }
    
    const ambulance = result.rows[0];
    
    if (ambulance.current_hospital_id) {
      const routeResult = await query(
        `SELECT * FROM ambulance_routes WHERE ambulance_id = $1 AND passed_signal = false ORDER BY distance_to_signal ASC LIMIT 1`,
        [ambulance.id]
      );
      
      if (routeResult.rows.length > 0) {
        const route = routeResult.rows[0];
        const distance = haversineDistance(latitude, longitude, 
          (await query('SELECT latitude, longitude FROM traffic_signals WHERE id = $1', [route.signal_id])).rows[0]?.latitude || 0,
          (await query('SELECT latitude, longitude FROM traffic_signals WHERE id = $1', [route.signal_id])).rows[0]?.longitude || 0
        );
        
        if (distance <= 0.5) {
          await query(
            `UPDATE ambulance_routes SET signal_activated = true WHERE id = $1`,
            [route.id]
          );
          
          const io = req.app.get('io');
          io.to(`traffic_signal_${route.signal_id}`).emit('ambulance_approaching', {
            ambulance_id: ambulance.id,
            vehicle_number: ambulance.vehicle_number,
            direction: route.direction,
            distance_km: distance.toFixed(2)
          });
        }
      }
    }
    
    const io = req.app.get('io');
    io.to(`emergency_tracking`).emit('ambulance_location_update', {
      ambulance_id: ambulance.id,
      vehicle_number: ambulance.vehicle_number,
      latitude,
      longitude,
      status: ambulance.status
    });
    
    res.json({ ambulance: result.rows[0] });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

router.put('/status', [
  body('status').isIn(['available', 'en_route', 'engaged', 'offline']).withMessage('Invalid status'),
], validateRequest, async (req, res) => {
  try {
    const { status } = req.body;
    
    const result = await query(
      `UPDATE ambulances SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *`,
      [status, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ambulance not found' });
    }
    
    const io = req.app.get('io');
    io.to('ambulance_status').emit('status_changed', {
      ambulance_id: result.rows[0].id,
      vehicle_number: result.rows[0].vehicle_number,
      status
    });
    
    res.json({ ambulance: result.rows[0] });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.get('/assigned-emergency', async (req, res) => {
  try {
    const result = await query(
      `SELECT er.*, h.name as hospital_name, h.address as hospital_address, h.latitude as hospital_lat, h.longitude as hospital_lng
       FROM emergency_requests er
       LEFT JOIN hospitals h ON er.hospital_id = h.id
       WHERE er.ambulance_id IN (SELECT id FROM ambulances WHERE user_id = $1)
       AND er.status IN ('assigned', 'en_route', 'arrived')
       ORDER BY er.created_at DESC LIMIT 1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.json({ emergency: null });
    }
    
    res.json({ emergency: result.rows[0] });
  } catch (error) {
    console.error('Get assigned emergency error:', error);
    res.status(500).json({ error: 'Failed to get assigned emergency' });
  }
});

router.post('/navigate-to-hospital', [
  body('hospital_id').isUUID().withMessage('Valid hospital ID required'),
], validateRequest, async (req, res) => {
  try {
    const { hospital_id } = req.body;
    
    const ambulanceResult = await query('SELECT * FROM ambulances WHERE user_id = $1', [req.user.id]);
    if (ambulanceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ambulance not found' });
    }
    
    const ambulance = ambulanceResult.rows[0];
    
    const hospitalResult = await query('SELECT * FROM hospitals WHERE id = $1', [hospital_id]);
    if (hospitalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    const hospital = hospitalResult.rows[0];
    
    await query(
      `UPDATE ambulances SET current_hospital_id = $1, status = 'en_route', updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [hospital_id, ambulance.id]
    );
    
    const signalsResult = await query(
      `SELECT * FROM traffic_signals WHERE is_active = true`
    );
    
    const routes = [];
    for (const signal of signalsResult.rows) {
      const distance = haversineDistance(ambulance.latitude, ambulance.longitude, signal.latitude, signal.longitude);
      
      let direction = '';
      const latDiff = hospital.latitude - ambulance.latitude;
      const lngDiff = hospital.longitude - ambulance.longitude;
      
      if (Math.abs(latDiff) > Math.abs(lngDiff)) {
        direction = latDiff > 0 ? 'north' : 'south';
      } else {
        direction = lngDiff > 0 ? 'east' : 'west';
      }
      
      if (distance <= 5) {
        const routeResult = await query(
          `INSERT INTO ambulance_routes (ambulance_id, emergency_request_id, signal_id, direction, distance_to_signal)
           VALUES ($1, (SELECT id FROM emergency_requests WHERE ambulance_id = $1 AND status IN ('assigned', 'en_route') ORDER BY created_at DESC LIMIT 1), $2, $3, $4)
           RETURNING *`,
          [ambulance.id, signal.id, direction, distance]
        );
        routes.push(routeResult.rows[0]);
      }
    }
    
    const io = req.app.get('io');
    io.to(`ambulance_${ambulance.id}`).emit('navigation_started', {
      hospital: { id: hospital.id, name: hospital.name, latitude: hospital.latitude, longitude: hospital.longitude },
      signals_on_route: routes.map(r => ({ signal_id: r.signal_id, direction: r.direction, distance: r.distance_to_signal }))
    });
    
    res.json({ 
      message: 'Navigation started',
      hospital,
      signals_on_route: routes.length
    });
  } catch (error) {
    console.error('Navigate to hospital error:', error);
    res.status(500).json({ error: 'Failed to start navigation' });
  }
});

router.get('/nearby-hospitals', async (req, res) => {
  try {
    const ambulanceResult = await query('SELECT latitude, longitude FROM ambulances WHERE user_id = $1', [req.user.id]);
    if (ambulanceResult.rows.length === 0 || !ambulanceResult.rows[0].latitude) {
      return res.status(400).json({ error: 'Ambulance location not set' });
    }
    
    const { latitude, longitude } = ambulanceResult.rows[0];
    
    const result = await query(
      `SELECT *, 
        (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) AS distance_km
       FROM hospitals 
       WHERE is_active = true
       ORDER BY distance_km ASC
       LIMIT 10`,
      [latitude, longitude]
    );
    
    res.json({ hospitals: result.rows });
  } catch (error) {
    console.error('Get nearby hospitals error:', error);
    res.status(500).json({ error: 'Failed to get nearby hospitals' });
  }
});

module.exports = router;