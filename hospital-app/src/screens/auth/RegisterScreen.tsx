import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, TextInput, Card, Title, Paragraph } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import * as Location from 'expo-location';
import styles from './styles';

export const RegisterScreen = () => {
  const { register } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    hospitalName: '',
    address: '',
    latitude: 0,
    longitude: 0,
    license_number: '',
    specialties: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to register hospital location');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
      
      const address = await Location.reverseGeocodeAsync(location.coords);
      if (address[0]) {
        const addr = `${address[0].street || ''}, ${address[0].city || ''}, ${address[0].region || ''} ${address[0].postalCode || ''}`.trim();
        setFormData(prev => ({ ...prev, address: addr }));
      }
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setGettingLocation(false);
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.phone || !formData.password || !formData.confirmPassword ||
        !formData.hospitalName || !formData.address) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await register({
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        hospitalName: formData.hospitalName,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        license_number: formData.license_number,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
      });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>HealthService</Text>
          <Text style={styles.tagline}>Register Your Hospital</Text>
        </View>
        
        <Card style={[styles.card, styles.registerContainer]} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.title}>Hospital Registration</Title>
            <Paragraph style={styles.subtitle}>Enter hospital details to get started</Paragraph>
            
            {error && <Text style={styles.error}>{error}</Text>}
            
            <TextInput
              label="Hospital Name"
              value={formData.hospitalName}
              onChangeText={v => handleChange('hospitalName', v)}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Address"
              value={formData.address}
              onChangeText={v => handleChange('address', v)}
              mode="outlined"
              style={styles.input}
              multiline
            />
            
            <TouchableOpacity
              style={[styles.locationButton, gettingLocation && styles.locationButtonLoading]}
              onPress={getCurrentLocation}
              disabled={gettingLocation}
            >
              <Text style={styles.locationButtonText}>
                {gettingLocation ? 'Getting Location...' : '📍 Use Current Location'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.coordsDisplay}>
              <Text style={styles.coordLabel}>Latitude:</Text>
              <Text style={styles.coordValue}>{formData.latitude.toFixed(6)}</Text>
              <Text style={styles.coordLabel}>Longitude:</Text>
              <Text style={styles.coordValue}>{formData.longitude.toFixed(6)}</Text>
            </View>
            
            <TextInput
              label="Hospital Phone"
              value={formData.phone}
              onChangeText={v => handleChange('phone', v)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
            />
            
            <TextInput
              label="Hospital Email"
              value={formData.email}
              onChangeText={v => handleChange('email', v)}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              label="License Number (Optional)"
              value={formData.license_number}
              onChangeText={v => handleChange('license_number', v)}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Specialties (comma separated)"
              value={formData.specialties}
              onChangeText={v => handleChange('specialties', v)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Cardiology, Neurology, Emergency"
            />
            
            <TextInput
              label="Admin Password"
              value={formData.password}
              onChangeText={v => handleChange('password', v)}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              autoComplete="new-password"
            />
            
            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={v => handleChange('confirmPassword', v)}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              autoComplete="new-password"
            />
            
            <Button
              mode="contained"
              style={styles.button}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Register Hospital</Text>}
            </Button>
          </Card.Content>
        </Card>
        
        <View style={styles.bottomText}>
          <Text style={styles.linkText}>Already registered? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};