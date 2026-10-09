import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Card, Title, Chip, Button, Avatar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { ambulanceApi, emergencyApi } from '../../services/api';
import * as Location from 'expo-location';
import styles from './styles';

export const DashboardScreen = () => {
  const { user } = useAuth();
  const [ambulance, setAmbulance] = useState<any>(null);
  const [assignedEmergency, setAssignedEmergency] = useState<any | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  const loadData = async () => {
    try {
      const [ambulanceRes, emergencyRes] = await Promise.all([
        ambulanceApi.getProfile(),
        ambulanceApi.getAssignedEmergency(),
      ]);
      setAmbulance(ambulanceRes.data.ambulance);
      setAssignedEmergency(emergencyRes.data.emergency);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Location permission is required for tracking');
      return;
    }
    
    setTracking(true);
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
    setLocation(coords);
    await updateLocation(coords.latitude, coords.longitude);
    
    const watchId = Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      async (newLocation) => {
        const coords = { latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude };
        setLocation(coords);
        await updateLocation(coords.latitude, coords.longitude);
      }
    );
    
    return watchId;
  };

  const stopLocationTracking = async () => {
    setTracking(false);
  };

  const updateLocation = async (latitude: number, longitude: number) => {
    try {
      await ambulanceApi.updateLocation(latitude, longitude);
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await ambulanceApi.updateStatus(status);
      const updated = { ...ambulance, status };
      setAmbulance(updated);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleAcceptEmergency = async (emergencyId: string) => {
    try {
      await emergencyApi.updateStatus(emergencyId, 'en_route');
      setAssignedEmergency(prev => prev ? { ...prev, status: 'en_route' } : null);
      setAmbulance(prev => prev ? { ...prev, status: 'en_route' } : null);
    } catch (error) {
      Alert.alert('Error', 'Failed to accept emergency');
    }
  };

  const handleArrived = async () => {
    if (!assignedEmergency) return;
    try {
      await emergencyApi.updateStatus(assignedEmergency.id, 'arrived');
      setAssignedEmergency(prev => prev ? { ...prev, status: 'arrived' } : null);
      setAmbulance(prev => prev ? { ...prev, status: 'engaged' } : null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleComplete = async () => {
    if (!assignedEmergency) return;
    try {
      await emergencyApi.updateStatus(assignedEmergency.id, 'completed');
      setAssignedEmergency(null);
      setAmbulance(prev => prev ? { ...prev, status: 'available' } : null);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete emergency');
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E65100" />
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#2E7D32';
      case 'en_route': return '#E65100';
      case 'engaged': return '#1565C0';
      case 'offline': return '#757575';
      default: return '#666666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Title style={styles.driverName}>{ambulance?.driver_name || 'Driver'}</Title>
          <Text style={styles.vehicleInfo}>{ambulance?.vehicle_number} • {ambulance?.vehicle_type}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(ambulance?.status) + '20' }]}
            textStyle={{ color: getStatusColor(ambulance?.status) }}
          >
            {ambulance?.status?.toUpperCase() || 'OFFLINE'}
          </Chip>
        </View>
      </View>

      <View style={styles.statusRow}>
        <TouchableOpacity
          style={[styles.statusButton, ambulance?.status === 'available' && styles.statusButtonActive]}
          onPress={() => handleStatusChange('available')}
          disabled={tracking}
        >
          <Text style={styles.statusButtonText}>Available</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, ambulance?.status === 'en_route' && styles.statusButtonActive]}
          onPress={() => handleStatusChange('en_route')}
          disabled={tracking}
        >
          <Text style={styles.statusButtonText}>En Route</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, ambulance?.status === 'engaged' && styles.statusButtonActive]}
          onPress={() => handleStatusChange('engaged')}
          disabled={tracking}
        >
          <Text style={styles.statusButtonText}>Engaged</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, ambulance?.status === 'offline' && styles.statusButtonActive]}
          onPress={() => handleStatusChange('offline')}
        >
          <Text style={styles.statusButtonText}>Offline</Text>
        </TouchableOpacity>
      </View>

      {tracking ? (
        <Button
          mode="outlined"
          icon="location-off"
          onPress={stopLocationTracking}
          style={styles.trackingButton}
        >
          <Text style={styles.trackingButtonText}>Stop Location Tracking</Text>
        </Button>
      ) : (
        <Button
          mode="contained"
          icon="location-on"
          onPress={startLocationTracking}
          style={styles.trackingButton}
        >
          <Text style={styles.trackingButtonText}>Start Location Tracking</Text>
        </Button>
      )}

      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Current Location</Text>
          <Text style={styles.locationCoords}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {assignedEmergency && (
        <View style={styles.emergencySection}>
          <Title style={styles.sectionTitle}>Active Emergency</Title>
          <Card style={styles.emergencyCard} elevation={4}>
            <Card.Content>
              <View style={styles.emergencyHeader}>
                <View style={styles.emergencyIcon} />
                <View style={styles.emergencyInfo}>
                  <Text style={styles.emergencyPatient}>
                    {assignedEmergency.patient_details?.name || 'Unknown Patient'}
                  </Text>
                  <Text style={styles.emergencyPhone}>
                    {assignedEmergency.patient_details?.phone || ''}
                  </Text>
                </View>
              </View>
              
              <View style={styles.emergencyDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Blood Group:</Text>
                  <Text style={styles.detailValue}>
                    {assignedEmergency.patient_details?.blood_group || 'Unknown'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Conditions:</Text>
                  <Text style={styles.detailValue}>
                    {assignedEmergency.patient_details?.diseases?.join(', ') || 'None'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Emergency Contact:</Text>
                  <Text style={styles.detailValue}>
                    {assignedEmergency.patient_details?.emergency_contact?.name || 'Not provided'}
                  </Text>
                </View>
              </View>

              <View style={styles.emergencyActions}>
                {assignedEmergency.status === 'assigned' && (
                  <Button mode="contained" onPress={() => handleAcceptEmergency(assignedEmergency.id)} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Accept & Respond</Text>
                  </Button>
                )}
                {assignedEmergency.status === 'en_route' && (
                  <Button mode="contained" onPress={handleArrived} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Mark as Arrived</Text>
                  </Button>
                )}
                {assignedEmergency.status === 'arrived' && (
                  <Button mode="contained" onPress={handleComplete} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Complete & Transport to Hospital</Text>
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
};