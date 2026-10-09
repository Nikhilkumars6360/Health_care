import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { Button, TextInput, Card, Title, Paragraph, Chip, Avatar, Switch, Dialog } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import styles from './styles';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const ProfileScreen = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showBloodGroupPicker, setShowBloodGroupPicker] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    blood_group: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    diseases: [] as string[],
    allergies: [] as string[],
    newDisease: '',
    newAllergy: '',
  });

  const loadProfile = async () => {
    try {
      const response = await profileApi.get();
      setProfile(response.data.profile);
      setFormData(prev => ({
        ...prev,
        first_name: response.data.profile.first_name || '',
        last_name: response.data.profile.last_name || '',
        date_of_birth: response.data.profile.date_of_birth || '',
        blood_group: response.data.profile.blood_group || '',
        emergency_contact_name: response.data.profile.emergency_contact_name || '',
        emergency_contact_phone: response.data.profile.emergency_contact_phone || '',
        emergency_contact_relationship: response.data.profile.emergency_contact_relationship || '',
        diseases: response.data.profile.diseases || [],
        allergies: response.data.profile.allergies || [],
      }));
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.update(formData);
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      await refreshUser();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addDisease = () => {
    if (formData.newDisease.trim() && !formData.diseases.includes(formData.newDisease.trim())) {
      setFormData(prev => ({
        ...prev,
        diseases: [...prev.diseases, prev.newDisease.trim()],
        newDisease: '',
      }));
    }
  };

  const removeDisease = (disease: string) => {
    setFormData(prev => ({
      ...prev,
      diseases: prev.diseases.filter(d => d !== disease),
    }));
  };

  const addAllergy = () => {
    if (formData.newAllergy.trim() && !formData.allergies.includes(formData.newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, prev.newAllergy.trim()],
        newAllergy: '',
      }));
    }
  };

  const removeAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy),
    }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="account-circle" style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile?.first_name} {profile?.last_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
        </View>
      </View>

      <Card style={styles.card} elevation={2}>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.sectionTitle}>Personal Information</Title>
          
          <View style={styles.nameRow}>
            <TextInput
              label="First Name"
              value={formData.first_name}
              onChangeText={v => handleChange('first_name', v)}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              editable={editing}
            />
            <TextInput
              label="Last Name"
              value={formData.last_name}
              onChangeText={v => handleChange('last_name', v)}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              editable={editing}
            />
          </View>

          <TextInput
            label="Date of Birth"
            value={formData.date_of_birth}
            onChangeText={v => handleChange('date_of_birth', v)}
            mode="outlined"
            style={styles.input}
            editable={editing}
            placeholder="YYYY-MM-DD"
          />

          <TouchableOpacity
            style={[styles.picker, editing && styles.pickerActive]}
            onPress={() => editing && setShowBloodGroupPicker(true)}
          >
            <Text style={styles.pickerLabel}>Blood Group</Text>
            <Text style={styles.pickerValue}>
              {formData.blood_group || 'Select blood group'}
            </Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Card style={styles.card} elevation={2}>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.sectionTitle}>Emergency Contact</Title>
          
          <TextInput
            label="Contact Name"
            value={formData.emergency_contact_name}
            onChangeText={v => handleChange('emergency_contact_name', v)}
            mode="outlined"
            style={styles.input}
            editable={editing}
          />
          
          <TextInput
            label="Contact Phone"
            value={formData.emergency_contact_phone}
            onChangeText={v => handleChange('emergency_contact_phone', v)}
            mode="outlined"
            style={styles.input}
            editable={editing}
            keyboardType="phone-pad"
          />
          
          <TextInput
            label="Relationship"
            value={formData.emergency_contact_relationship}
            onChangeText={v => handleChange('emergency_contact_relationship', v)}
            mode="outlined"
            style={styles.input}
            editable={editing}
            placeholder="e.g., Spouse, Parent, Sibling"
          />
        </Card.Content>
      </Card>

      <Card style={styles.card} elevation={2}>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.sectionTitle}>Medical Conditions</Title>
          
          <View style={styles.chipContainer}>
            {formData.diseases.map((disease, index) => (
              <Chip
                key={index}
                style={styles.chip}
                onClose={() => editing && removeDisease(disease)}
                closeIconVisible={editing}
              >
                {disease}
              </Chip>
            ))}
          </View>
          
          {editing && (
            <View style={styles.addItemRow}>
              <TextInput
                label="Add Condition"
                value={formData.newDisease}
                onChangeText={v => handleChange('newDisease', v)}
                mode="outlined"
                style={[styles.input, styles.flexInput]}
                onSubmitEditing={addDisease}
              />
              <Button mode="outlined" onPress={addDisease} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add</Text>
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card} elevation={2}>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.sectionTitle}>Allergies</Title>
          
          <View style={styles.chipContainer}>
            {formData.allergies.map((allergy, index) => (
              <Chip
                key={index}
                style={styles.chip}
                onClose={() => editing && removeAllergy(allergy)}
                closeIconVisible={editing}
              >
                {allergy}
              </Chip>
            ))}
          </View>
          
          {editing && (
            <View style={styles.addItemRow}>
              <TextInput
                label="Add Allergy"
                value={formData.newAllergy}
                onChangeText={v => handleChange('newAllergy', v)}
                mode="outlined"
                style={[styles.input, styles.flexInput]}
                onSubmitEditing={addAllergy}
              />
              <Button mode="outlined" onPress={addAllergy} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add</Text>
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonRow}>
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
      </View>

      <Dialog visible={showBloodGroupPicker} onDismiss={() => setShowBloodGroupPicker(false)}>
        <Dialog.Title>Select Blood Group</Dialog.Title>
        <Dialog.Content>
          <View style={styles.pickerList}>
            {BLOOD_GROUPS.map(group => (
              <TouchableOpacity
                key={group}
                style={[styles.pickerItem, formData.blood_group === group && styles.pickerItemSelected]}
                onPress={() => { handleChange('blood_group', group); setShowBloodGroupPicker(false); }}
              >
                <Text style={[styles.pickerItemText, formData.blood_group === group && styles.pickerItemTextSelected]}>{group}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Dialog.Content>
      </Dialog>
    </View>
  );
};