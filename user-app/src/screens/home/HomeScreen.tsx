import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { Button, Card, Title, Paragraph, Chip, Avatar, Snackbar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { emergencyApi, profileApi } from '../../services/api';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import styles from './styles';

export const HomeScreen = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadProfile = async () => {
    try {
      const response = await profileApi.get();
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'HealthService needs access to your location for emergency services.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Location permission is required for emergency services.');
      return null;
    }
    
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };
  };

  const triggerEmergency = async () => {
    setEmergencyLoading(true);
    try {
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        setEmergencyLoading(false);
        return;
      }

      setLocation(currentLocation);
      
      const address = await Location.reverseGeocodeAsync(currentLocation);
      const addressString = address[0] 
        ? `${address[0].street || ''}, ${address[0].city || ''}, ${address[0].region || ''}`.trim()
        : '';

      const response = await emergencyApi.trigger(
        currentLocation.latitude,
        currentLocation.longitude,
        addressString
      );

      const { emergency } = response.data;
      
      if (profile?.emergency_contact_phone) {
        const message = `EMERGENCY ALERT: ${profile.first_name} ${profile.last_name} has triggered an emergency. Location: ${addressString || `Lat: ${currentLocation.latitude}, Lng: ${currentLocation.longitude}`}. ${emergency.ambulance ? `Ambulance ${emergency.ambulance.vehicle_number} dispatched.` : 'Waiting for available ambulance.'}`;
        
        try {
          await SMS.sendSMSAsync(profile.emergency_contact_phone, message);
        } catch (smsError) {
          console.error('Failed to send SMS:', smsError);
        }
      }

      setSnackbarMessage(
        emergency.ambulance 
          ? `Emergency triggered! Ambulance ${emergency.ambulance.vehicle_number} dispatched. ETA: ${emergency.estimated_arrival}`
          : 'Emergency triggered! Waiting for available ambulance.'
      );
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error('Emergency error:', error);
      setSnackbarMessage(error.response?.data?.error || 'Failed to trigger emergency. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setEmergencyLoading(false);
    }
  };

  const handleEmergencyPress = () => {
    Alert.alert(
      'Emergency Alert',
      'This will immediately notify the nearest ambulance and send an SMS to your emergency contact with your location. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'YES, EMERGENCY', style: 'destructive', onPress: triggerEmergency },
      ]
    );
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hello, {profile?.first_name || 'User'}</Text>
          <Text style={styles.subtitle}>Stay safe, stay healthy</Text>
        </View>
        <Avatar.Icon size={48} icon="account-circle" style={styles.avatar} />
      </View>

      <Card style={styles.emergencyCard} elevation={4}>
        <Card.Content style={styles.emergencyCardContent}>
          <View style={styles.emergencyIconContainer}>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={handleEmergencyPress}
              disabled={emergencyLoading}
              activeOpacity={0.8}
            >
              <View style={styles.pulseRing} />
              <View style={styles.pulseRing} />
              <View style={styles.emergencyButtonInner}>
                <Text style={styles.emergencyText}>EMERGENCY</Text>
                <Text style={styles.emergencySubtext}>Press for immediate help</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {emergencyLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Dispatching ambulance...</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => {}}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>💊</Text>
            </View>
            <Text style={styles.actionLabel}>Medications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => {}}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📄</Text>
            </View>
            <Text style={styles.actionLabel}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => {}}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📅</Text>
            </View>
            <Text style={styles.actionLabel}>Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => {}}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>👤</Text>
            </View>
            <Text style={styles.actionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {profile && (
        <View style={styles.infoCards}>
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.infoLabel}>Blood Group</Text>
              <Text style={styles.infoValue}>{profile.blood_group || 'Not set'}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.infoLabel}>Emergency Contact</Text>
              <Text style={styles.infoValue}>
                {profile.emergency_contact_name ? `${profile.emergency_contact_name} (${profile.emergency_contact_relationship})` : 'Not set'}
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{ label: 'Dismiss', onPress: () => setSnackbarVisible(false) }}
        duration={5000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};