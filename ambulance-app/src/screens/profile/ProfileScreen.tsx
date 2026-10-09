import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Card, Title, Button, TextInput, Avatar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { ambulanceApi } from '../../services/api';
import styles from './styles';

export const ProfileScreen = () => {
  const { user, logout, refreshUser } = useAuth();
  const [ambulance, setAmbulance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    driver_name: '',
    driver_phone: '',
    vehicle_number: '',
    vehicle_type: 'basic' as 'basic' | 'advanced' | 'icu',
  });

  const loadProfile = async () => {
    try {
      const response = await ambulanceApi.getProfile();
      setAmbulance(response.data.ambulance);
      setFormData({
        driver_name: response.data.ambulance.driver_name || '',
        driver_phone: response.data.ambulance.driver_phone || '',
        vehicle_number: response.data.ambulance.vehicle_number || '',
        vehicle_type: response.data.ambulance.vehicle_type || 'basic',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Note: Profile update would need a PUT endpoint
      Alert.alert('Info', 'Profile update endpoint needed in backend');
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E65100" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="ambulance" style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{ambulance?.driver_name || 'Driver'}</Text>
          <Text style={styles.vehicle}>{ambulance?.vehicle_number} • {ambulance?.vehicle_type}</Text>
        </View>
      </View>

      <Card style={styles.card} elevation={2}>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.sectionTitle}>Profile Information</Title>
          
          <TextInput
            label="Driver Name"
            value={formData.driver_name}
            onChangeText={v => setFormData(prev => ({ ...prev, driver_name: v }))}
            mode="outlined"
            style={styles.input}
            editable={editing}
          />
          
          <TextInput
            label="Driver Phone"
            value={formData.driver_phone}
            onChangeText={v => setFormData(prev => ({ ...prev, driver_phone: v }))}
            mode="outlined"
            style={styles.input}
            editable={editing}
            keyboardType="phone-pad"
          />
          
          <TextInput
            label="Vehicle Number"
            value={formData.vehicle_number}
            onChangeText={v => setFormData(prev => ({ ...prev, vehicle_number: v }))}
            mode="outlined"
            style={styles.input}
            editable={editing}
            textTransform="uppercase"
          />
          
          <TextInput
            label="Vehicle Type"
            value={formData.vehicle_type}
            onChangeText={v => setFormData(prev => ({ ...prev, vehicle_type: v }))}
            mode="outlined"
            style={styles.input}
            editable={editing}
          />
          
          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>Account Email</Text>
            <Text style={styles.accountValue}>{user?.email}</Text>
            <Text style={styles.accountLabel}>Account Phone</Text>
            <Text style={styles.accountValue}>{user?.phone}</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonSection}>
        {editing ? (
          <>
            <Button mode="outlined" onPress={() => { loadProfile(); setEditing(false); }} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Button>
            <Button mode="contained" onPress={handleSave} loading={saving} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Button>
          </>
        ) : (
          <Button mode="contained" onPress={() => setEditing(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Button>
        )}
        
        <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Button>
      </View>
    </View>
  );
};