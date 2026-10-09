import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, TextInput, Card, Title, Paragraph } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import styles from './styles';

const VEHICLE_TYPES = ['basic', 'advanced', 'icu'] as const;

export const RegisterScreen = () => {
  const { register } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    vehicleType: 'basic' as 'basic' | 'advanced' | 'icu',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.phone || !formData.password || !formData.confirmPassword ||
        !formData.driverName || !formData.driverPhone || !formData.vehicleNumber) {
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
        driverName: formData.driverName,
        driverPhone: formData.driverPhone,
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
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
          <Text style={styles.tagline}>Register Your Ambulance</Text>
        </View>
        
        <Card style={[styles.card, styles.registerContainer]} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.title}>Ambulance Registration</Title>
            <Paragraph style={styles.subtitle}>Enter driver and vehicle details</Paragraph>
            
            {error && <Text style={styles.error}>{error}</Text>}
            
            <TextInput
              label="Driver Name"
              value={formData.driverName}
              onChangeText={v => handleChange('driverName', v)}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Driver Phone"
              value={formData.driverPhone}
              onChangeText={v => handleChange('driverPhone', v)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
            />
            
            <TextInput
              label="Vehicle Number"
              value={formData.vehicleNumber}
              onChangeText={v => handleChange('vehicleNumber', v)}
              mode="outlined"
              style={styles.input}
              textTransform="uppercase"
            />
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Vehicle Type</Text>
              <TextInput
                label="Select Type"
                value={formData.vehicleType}
                onChangeText={v => handleChange('vehicleType', v)}
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
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Register Ambulance</Text>}
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