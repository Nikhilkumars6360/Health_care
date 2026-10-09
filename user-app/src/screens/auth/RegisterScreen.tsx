import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, TextInput, Card, Title, Paragraph } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import styles from './styles';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
    firstName: '',
    lastName: '',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.phone || !formData.password || !formData.confirmPassword ||
        !formData.firstName || !formData.lastName) {
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
        firstName: formData.firstName,
        lastName: formData.lastName,
        bloodGroup: formData.bloodGroup || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
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
          <Text style={styles.tagline}>Create your health account</Text>
        </View>
        
        <Card style={[styles.card, styles.registerContainer]} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.title}>Create Account</Title>
            <Paragraph style={styles.subtitle}>Enter your details to get started</Paragraph>
            
            {error && <Text style={styles.error}>{error}</Text>}
            
            <View style={styles.nameRow}>
              <TextInput
                label="First Name"
                value={formData.firstName}
                onChangeText={v => handleChange('firstName', v)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={v => handleChange('lastName', v)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
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
              autoComplete="email"
            />
            
            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={v => handleChange('phone', v)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              autoComplete="tel"
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
            
            <Text style={styles.sectionTitle}>Medical Information (Optional)</Text>
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Blood Group</Text>
              <TextInput
                label="Select Blood Group"
                value={formData.bloodGroup}
                onChangeText={v => handleChange('bloodGroup', v)}
                mode="outlined"
                style={styles.input}
                editable={false}
                right={<View style={styles.pickerIcon} />}
              />
            </View>
            
            <Text style={styles.sectionTitle}>Emergency Contact (Optional)</Text>
            
            <TextInput
              label="Contact Name"
              value={formData.emergencyContactName}
              onChangeText={v => handleChange('emergencyContactName', v)}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Contact Phone"
              value={formData.emergencyContactPhone}
              onChangeText={v => handleChange('emergencyContactPhone', v)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
            />
            
            <TextInput
              label="Relationship"
              value={formData.emergencyContactRelationship}
              onChangeText={v => handleChange('emergencyContactRelationship', v)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Spouse, Parent, Sibling"
            />
            
            <Button
              mode="contained"
              style={styles.button}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Create Account</Text>}
            </Button>
          </Card.Content>
        </Card>
        
        <View style={styles.bottomText}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};