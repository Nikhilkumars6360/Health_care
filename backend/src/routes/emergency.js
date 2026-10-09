const express = require('express');
const { body } = require('express-validator');
const { query } = require('../db/pool');
const { validateRequest, authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

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

router.post('/trigger', [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('address').optional().trim(),
], validateRequest, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const userId = req.user.id;
    
    const userResult = await query(
      `SELECT u.email, u.phone, up.first_name, up.last_name, up.blood_group, up.diseases,
              up.emergency_contact_name, up.emergency_contact_phone, up.emergency_contact_relationship
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    const ambulancesResult = await query(
      `SELECT id, driver_name, driver_phone, vehicle_number, vehicle_type, latitude, longitude
       FROM ambulances 
       WHERE status = 'available' AND latitude IS NOT NULL AND longitude IS NOT NULL`
    );
    
    let nearestAmbulance = null;
    let minDistance = Infinity;
    
    for (const amb of ambulancesResult.rows) {
      const distance = haversineDistance(latitude, longitude, amb.latitude, amb.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearestAmbulance = { ...amb, distance };
      }
    }
    
    const patientDetails = {
      name: `${user.first_name} ${user.last_name}`,
      phone: user.phone,
      email: user.email,
      blood_group: user.blood_group,
      diseases: user.diseases,
      emergency_contact: {
        name: user.emergency_contact_name,
        phone: user.emergency_contact_phone,
        relationship: user.emergency_contact_relationship
      }
    };
    
    const emergencyResult = await query(
      `INSERT INTO emergency_requests (user_id, ambulance_id, latitude, longitude, address, patient_details, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, nearestAmbulance?.id || null, latitude, longitude, address, JSON.stringify(patientDetails), nearestAmbulance ? 'assigned' : 'pending']
    );
    
    const emergency = emergencyResult.rows[0];
    
    if (nearestAmbulance) {
      await query(
        `UPDATE ambulances SET status = 'en_route', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [nearestAmbulance.id]
      );
      
      await query(
        `UPDATE emergency_requests SET assigned_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [emergency.id]
      );
      
      const io = req.app.get('io');
      io.to(`ambulance_${nearestAmbulance.id}`).emit('emergency_assigned', {
        emergency_id: emergency.id,
        patient: patientDetails,
        location: { latitude, longitude, address },
        distance_km: nearestAmbulance.distance.toFixed(2)
      });
      
      if (user.emergency_contact_phone) {
        io.to('notifications').emit('send_sms', {
          to: user.emergency_contact_phone,
          message: `EMERGENCY ALERT: ${user.first_name} ${user.last_name} has triggered an emergency. Location: ${address || `Lat: ${latitude}, Lng: ${longitude}`}. Ambulance ${nearestAmbulance.vehicle_number} (${nearestAmbulance.driver_name}) dispatched.`
        });
      }
    }
    
    const io = req.app.get('io');
    io.to(`hospital_nearby_${latitude}_${longitude}`).emit('emergency_alert', {
      emergency_id: emergency.id,
      patient: patientDetails,
      location: { latitude, longitude, address },
      ambulance: nearestAmbulance
    });
    
    res.status(201).json({
      message: nearestAmbulance ? 'Emergency triggered - ambulance dispatched' : 'Emergency triggered - waiting for available ambulance',
      emergency: {
        id: emergency.id,
        status: emergency.status,
        ambulance: nearestAmbulance ? {
          id: nearestAmbulance.id,
          driver_name: nearestAmbulance.driver_name,
          driver_phone: nearestAmbulance.driver_phone,
          vehicle_number: nearestAmbulance.vehicle_number,
          distance_km: nearestAmbulance.distance.toFixed(2)
        } : null,
        estimated_arrival: nearestAmbulance ? `${Math.ceil(nearestAmbulance.distance * 2)} min` : 'Unknown'
      }
    });
  } catch (error) {
    console.error('Trigger emergency error:', error);
    res.status(500).json({ error: 'Failed to trigger emergency' });
  }
});

router.get('/my-emergencies', async (req, res) => {
  try {
    const result = await query(
      `SELECT er.*, a.driver_name, a.driver_phone, a.vehicle_number, a.vehicle_type
       FROM emergency_requests er
       LEFT JOIN ambulances a ON er.ambulance_id = a.id
       WHERE er.user_id = $1
       ORDER BY er.created_at DESC`,
      [req.user.id]
    );
    res.json({ emergencies: result.rows });
  } catch (error) {
    console.error('Get emergencies error:', error);
    res.status(500).json({ error: 'Failed to get emergencies' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let whereClause = 'WHERE er.id = $1';
    const params = [req.params.id];
    
    if (req.user.role === 'user') {
      whereClause += ' AND er.user_id = $2';
      params.push(req.user.id);
    } else if (req.user.role === 'ambulance_driver') {
      whereClause += ' AND er.ambulance_id IN (SELECT id FROM ambulances WHERE user_id = $2)';
      params.push(req.user.id);
    } else if (req.user.role === 'hospital') {
      whereClause += ' AND er.hospital_id = $2';
      params.push(req.user.id);
    }
    
    const result = await query(
      `SELECT er.*, a.driver_name, a.driver_phone, a.vehicle_number, a.vehicle_type,
              h.name as hospital_name, h.address as hospital_address
       FROM emergency_requests er
       LEFT JOIN ambulances a ON er.ambulance_id = a.id
       LEFT JOIN hospitals h ON er.hospital_id = h.id
       ${whereClause}`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emergency request not found' });
    }
    
    res.json({ emergency: result.rows[0] });
  } catch (error) {
    console.error('Get emergency error:', error);
    res.status(500).json({ error: 'Failed to get emergency' });
  }
});

router.put('/:id/status', authorizeRole('ambulance_driver', 'hospital'), [
  body('status').isIn(['assigned', 'en_route', 'arrived', 'completed', 'cancelled']).withMessage('Invalid status'),
], validateRequest, async (req, res) => {
  try {
    const { status } = req.body;
    const emergencyId = req.params.id;
    
    let whereClause = 'WHERE id = $1';
    const params = [emergencyId, status];
    
    if (req.user.role === 'ambulance_driver') {
      whereClause += ' AND ambulance_id IN (SELECT id FROM ambulances WHERE user_id = $3)';
      params.push(req.user.id);
    } else if (req.user.role === 'hospital') {
      whereClause += ' AND hospital_id = $3';
      params.push(req.user.id);
    }
    
    const updates = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
    
    if (status === 'arrived') updates.push('arrived_at = CURRENT_TIMESTAMP');
    if (status === 'completed') updates.push('completed_at = CURRENT_TIMESTAMP');
    
    const result = await query(
      `UPDATE emergency_requests SET ${updates.join(', ')} ${whereClause} RETURNING *`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emergency request not found or unauthorized' });
    }
    
    const emergency = result.rows[0];
    
    if (status === 'completed' && emergency.ambulance_id) {
      await query(
        `UPDATE ambulances SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [emergency.ambulance_id]
      );
    }
    
    const io = req.app.get('io');
    io.to(`emergency_${emergencyId}`).emit('status_update', { emergency_id: emergencyId, status });
    io.to(`user_${emergency.user_id}`).emit('emergency_status', { emergency_id: emergencyId, status });
    
    res.json({ emergency: result.rows[0] });
  } catch (error) {
    console.error('Update emergency status error:', error);
    res.status(500).json({ error: 'Failed to update emergency status' });
  }
});

router.post('/:id/assign-hospital', authorizeRole('ambulance_driver'), [
  body('hospital_id').isUUID().withMessage('Valid hospital ID required'),
], validateRequest, async (req, res) => {
  try {
    const { hospital_id } = req.body;
    const emergencyId = req.params.id;
    
    const hospitalCheck = await query('SELECT id FROM hospitals WHERE id = $1 AND is_active = true', [hospital_id]);
    if (hospitalCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found or inactive' });
    }
    
    const result = await query(
      `UPDATE emergency_requests 
       SET hospital_id = $1, status = 'en_route', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND ambulance_id IN (SELECT id FROM ambulances WHERE user_id = $3)
       RETURNING *`,
      [hospital_id, emergencyId, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emergency request not found or unauthorized' });
    }
    
    const io = req.app.get('io');
    io.to(`hospital_${hospital_id}`).emit('incoming_patient', {
      emergency_id: emergencyId,
      patient: result.rows[0].patient_details,
      eta: 'Calculating...'
    });
    
    res.json({ emergency: result.rows[0] });
  } catch (error) {
    console.error('Assign hospital error:', error);
    res.status(500).json({ error: 'Failed to assign hospital' });
  }
});

module.exports = router;