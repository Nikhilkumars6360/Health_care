import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { Button, TextInput, Card, Title, Chip, Dialog, Snackbar, TimePicker, DatePicker } from 'react-native-paper';
import { medicationApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import styles from './styles';

const FREQUENCY_OPTIONS = [
  { value: 1, label: 'Once daily' },
  { value: 2, label: 'Twice daily' },
  { value: 3, label: 'Three times daily' },
  { value: 4, label: 'Four times daily' },
];

export const MedicationsScreen = () => {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency_per_day: 1,
    times_per_day: ['08:00'],
    instructions: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    prescribed_by: '',
  });
  const [showTimePicker, setShowTimePicker] = useState<number | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadMedications = async () => {
    try {
      const response = await medicationApi.getAll(true);
      setMedications(response.data.medications);
    } catch (error) {
      console.error('Failed to load medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingMedication(null);
    setFormData({
      name: '',
      dosage: '',
      frequency_per_day: 1,
      times_per_day: ['08:00'],
      instructions: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
      prescribed_by: '',
    });
    setShowDialog(true);
  };

  const openEditDialog = (medication: any) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      frequency_per_day: medication.frequency_per_day,
      times_per_day: medication.times_per_day,
      instructions: medication.instructions || '',
      start_date: medication.start_date,
      end_date: medication.end_date || '',
      prescribed_by: medication.prescribed_by || '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.dosage.trim()) {
      Alert.alert('Error', 'Please fill in medication name and dosage');
      return;
    }
    
    setSaving(true);
    try {
      if (editingMedication) {
        await medicationApi.update(editingMedication.id, formData);
        setSnackbarMessage('Medication updated successfully');
      } else {
        await medicationApi.create(formData);
        setSnackbarMessage('Medication added successfully');
      }
      setSnackbarVisible(true);
      setShowDialog(false);
      loadMedications();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save medication');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await medicationApi.delete(id);
              loadMedications();
              setSnackbarMessage('Medication deleted');
              setSnackbarVisible(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete medication');
            }
          } 
        },
      ]
    );
  };

  const updateTime = (index: number, time: Date | undefined) => {
    if (time) {
      const newTimes = [...formData.times_per_day];
      newTimes[index] = format(time, 'HH:mm');
      setFormData(prev => ({ ...prev, times_per_day: newTimes }));
    }
    setShowTimePicker(null);
  };

  const addTimeSlot = () => {
    if (formData.times_per_day.length < formData.frequency_per_day) {
      const lastTime = formData.times_per_day[formData.times_per_day.length - 1];
      const [hours, minutes] = lastTime.split(':').map(Number);
      const newTime = format(new Date(2000, 0, 1, hours, minutes + 30), 'HH:mm');
      setFormData(prev => ({ ...prev, times_per_day: [...prev.times_per_day, newTime] }));
    }
  };

  const removeTimeSlot = (index: number) => {
    if (formData.times_per_day.length > 1) {
      setFormData(prev => ({
        ...prev,
        times_per_day: prev.times_per_day.filter((_, i) => i !== index),
      }));
    }
  };

  useEffect(() => {
    loadMedications();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading medications...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Title style={styles.headerTitle}>My Medications</Title>
          <Text style={styles.headerSubtitle}>{medications.length} active medication{medications.length !== 1 ? 's' : ''}</Text>
        </View>
        <Button mode="contained" onPress={openAddDialog} style={styles.addButton} icon="plus">
          <Text style={styles.addButtonText}>Add</Text>
        </Button>
      </View>

      {medications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💊</Text>
          <Text style={styles.emptyTitle}>No medications yet</Text>
          <Text style={styles.emptySubtitle}>Tap "Add" to add your first medication</Text>
          <Button mode="contained" onPress={openAddDialog} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Add Medication</Text>
          </Button>
        </View>
      ) : (
        <View style={styles.list}>
          {medications.map(med => (
            <Card key={med.id} style={styles.medCard} elevation={2}>
              <Card.Content style={styles.medCardContent}>
                <View style={styles.medHeader}>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{med.name}</Text>
                    <Text style={styles.medDosage}>{med.dosage}</Text>
                  </View>
                  <View style={styles.medActions}>
                    <TouchableOpacity onPress={() => openEditDialog(med)} style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(med.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.medDetails}>
                  <View style={styles.detailRow}>
                    <Chip style={styles.detailChip} icon="clock">
                      {med.frequency_per_day}x daily
                    </Chip>
                    {med.times_per_day.map((time: string, i: number) => (
                      <Chip key={i} style={styles.timeChip} icon="timer">
                        {format(parseISO(`2000-01-01T${time}`), 'h:mm a')}
                      </Chip>
                    ))}
                  </View>
                  
                  {med.instructions && (
                    <Text style={styles.instructions}>{med.instructions}</Text>
                  )}
                  
                  <View style={styles.medFooter}>
                    <Text style={styles.footerText}>
                      Started: {format(parseISO(med.start_date), 'MMM d, yyyy')}
                      {med.end_date ? ` • Ends: ${format(parseISO(med.end_date), 'MMM d, yyyy')}` : ''}
                    </Text>
                    {med.prescribed_by && (
                      <Text style={styles.footerText}>Prescribed by: {med.prescribed_by}</Text>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
        <Dialog.Title>{editingMedication ? 'Edit Medication' : 'Add Medication'}</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={styles.dialogContent}>
            <TextInput
              label="Medication Name"
              value={formData.name}
              onChangeText={v => setFormData(prev => ({ ...prev, name: v }))}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Dosage"
              value={formData.dosage}
              onChangeText={v => setFormData(prev => ({ ...prev, dosage: v }))}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., 500mg, 1 tablet, 5ml"
            />
            
            <View style={styles.frequencyContainer}>
              <Text style={styles.frequencyLabel}>Frequency per Day</Text>
              <View style={styles.frequencyButtons}>
                {FREQUENCY_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.frequencyButton,
                      formData.frequency_per_day === opt.value && styles.frequencyButtonActive,
                    ]}
                    onPress={() => {
                      const newFreq = opt.value;
                      const currentTimes = formData.times_per_day.length;
                      let newTimes = [...formData.times_per_day];
                      
                      if (newFreq > currentTimes) {
                        const lastTime = newTimes[newTimes.length - 1];
                        const [hours, minutes] = lastTime.split(':').map(Number);
                        for (let i = currentTimes; i < newFreq; i++) {
                          const nextTime = format(new Date(2000, 0, 1, hours, minutes + (i - currentTimes + 1) * 30), 'HH:mm');
                          newTimes.push(nextTime);
                        }
                      } else if (newFreq < currentTimes) {
                        newTimes = newTimes.slice(0, newFreq);
                      }
                      
                      setFormData(prev => ({ ...prev, frequency_per_day: newFreq, times_per_day: newTimes }));
                    }}
                  >
                    <Text style={[
                      styles.frequencyButtonText,
                      formData.frequency_per_day === opt.value && styles.frequencyButtonTextActive,
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <Text style={styles.frequencyLabel}>Times</Text>
            <View style={styles.timesContainer}>
              {formData.times_per_day.map((time, index) => (
                <View key={index} style={styles.timeRow}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowTimePicker(index)}
                  >
                    <Text style={styles.timeButtonText}>{format(parseISO(`2000-01-01T${time}`), 'h:mm a')}</Text>
                  </TouchableOpacity>
                  {formData.times_per_day.length > 1 && (
                    <TouchableOpacity onPress={() => removeTimeSlot(index)} style={styles.removeTimeButton}>
                      <Text style={styles.removeTimeButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {formData.times_per_day.length < formData.frequency_per_day && (
                <TouchableOpacity onPress={addTimeSlot} style={styles.addTimeButton}>
                  <Text style={styles.addTimeButtonText}>+ Add Time</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TextInput
              label="Instructions"
              value={formData.instructions}
              onChangeText={v => setFormData(prev => ({ ...prev, instructions: v }))}
              mode="outlined"
              style={styles.input}
              multiline
              placeholder="e.g., Take with food, avoid alcohol"
            />
            
            <View style={styles.dateRow}>
              <TextInput
                label="Start Date"
                value={formData.start_date}
                onChangeText={v => setFormData(prev => ({ ...prev, start_date: v }))}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                editable={false}
              />
              <TextInput
                label="End Date (Optional)"
                value={formData.end_date}
                onChangeText={v => setFormData(prev => ({ ...prev, end_date: v }))}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                editable={false}
              />
            </View>
            
            <TextInput
              label="Prescribed By"
              value={formData.prescribed_by}
              onChangeText={v => setFormData(prev => ({ ...prev, prescribed_by: v }))}
              mode="outlined"
              style={styles.input}
              placeholder="Doctor name"
            />
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowDialog(false)}>Cancel</Button>
          <Button onPress={handleSave} loading={saving}>
            {editingMedication ? 'Update' : 'Add'}
          </Button>
        </Dialog.Actions>
      </Dialog>

      {showTimePicker !== null && (
        <Dialog visible={true} onDismiss={() => setShowTimePicker(null)}>
          <Dialog.Title>Select Time</Dialog.Title>
          <Dialog.Content>
            <TimePicker
              mode="clock"
              value={formData.times_per_day[showTimePicker] ? parseISO(`2000-01-01T${formData.times_per_day[showTimePicker]}`) : new Date()}
              is24Hour={false}
              onChange={time => updateTime(showTimePicker, time)}
              onDismiss={() => setShowTimePicker(null)}
            />
          </Dialog.Content>
        </Dialog>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{ label: 'Dismiss', onPress: () => setSnackbarVisible(false) }}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};