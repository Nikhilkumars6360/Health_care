import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, TextInput, Card, Title, Paragraph } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import * as Location from 'expo-location';
import styles from './styles';

const JUNCTION_TYPES = ['four_way', 'three_way', 'roundabout'] as const;

export const RegisterScreen = () => {
  const { register } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    signalId: '',
    name: '',
    latitude: 0,
    longitude: 0,
    junctionType: 'four_way' as 'four_way' | 'three_way' | 'roundabout',
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
        Alert.alert('Permission Required', 'Location permission is needed');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setGettingLocation(false);
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.phone || !formData.password || !formData.confirmPassword ||
        !formData.signalId || !formData.name) {
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
        signalId: formData.signalId,
        name: formData.name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        junctionType: formData.junctionType,
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
          <Text style={styles.tagline}>Register Traffic Signal</Text>
        </View>
        
        <Card style={[styles.card, styles.registerContainer]} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.title}>Signal Registration</Title>
            <Paragraph style={styles.subtitle}>Enter signal details</Paragraph>
            
            {error && <Text style={styles.error}>{error}</Text>}
            
            <TextInput
              label="Signal ID"
              value={formData.signalId}
              onChangeText={v => handleChange('signalId', v)}
              mode="outlined"
              style={styles.input}
              placeholder="Unique signal identifier"
            />
            
            <TextInput
              label="Signal Name"
              value={formData.name}
              onChangeText={v => handleChange('name', v)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Main St & 1st Ave Junction"
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
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Junction Type</Text>
              <TextInput
                label="Select Type"
                value={formData.junctionType}
                onChangeText={v => handleChange('junctionType', v)}
                mode="outlined"
                style={styles.input}
                editable={false}
              />
            </View>
            
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={v => handleChange('email', v)}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              label="Phone"
              value={formData.phone}
              onChangeText={v => handleChange('phone', v)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
            />
            
            <TextInput
              label="Password"
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
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Register Signal</Text>}
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