import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Card, Title, Button, TextInput, Avatar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { trafficApi } from '../../services/api';
import styles from './styles';

export const ProfileScreen = () => {
  const { user, logout, refreshUser } = useAuth();
  const [signal, setSignal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    junction_type: 'four_way' as 'four_way' | 'three_way' | 'roundabout',
  });

  const loadProfile = async () => {
    try {
      const response = await trafficApi.getProfile();
      setSignal(response.data.signal);
      setFormData({
        name: response.data.signal.name || '',
        junction_type: response.data.signal.junction_type || 'four_way',
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
        <ActivityIndicator size="large" color="#6A1B9A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="traffic-light" style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{signal?.name || 'Traffic Signal'}</Text>
          <Text style={styles.signalId}>ID: {signal?.signal_id || ''}</Text>
        </View>
      </View>

      <Card style={styles.card} elevation={2}>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.sectionTitle}>Signal Information</Title>
          
          <TextInput
            label="Signal Name"
            value={formData.name}
            onChangeText={v => setFormData(prev => ({ ...prev, name: v }))}
            mode="outlined"
            style={styles.input}
            editable={editing}
          />
          
          <TextInput
            label="Junction Type"
            value={formData.junction_type}
            onChangeText={v => setFormData(prev => ({ ...prev, junction_type: v }))}
            mode="outlined"
            style={styles.input}
            editable={editing}
          />
          
          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>Account Email</Text>
            <Text style={styles.accountValue}>{user?.email}</Text>
            <Text style={styles.accountLabel}>Account Phone</Text>
            <Text style={styles.accountValue}>{user?.phone}</Text>
            <Text style={styles.accountLabel}>Location</Text>
            <Text style={styles.accountValue}>
              {signal?.latitude?.toFixed(6)}, {signal?.longitude?.toFixed(6)}
            </Text>
            <Text style={styles.accountLabel}>Status</Text>
            <Text style={styles.accountValue}>
              {signal?.is_active ? 'Active' : 'Inactive'}
            </Text>
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