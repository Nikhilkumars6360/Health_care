import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Button, TextInput, Card, Title, Chip, Dialog, Snackbar, DatePicker, ActivityIndicator } from 'react-native-paper';
import { appointmentApi, hospitalApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import * as Location from 'expo-location';
import styles from './styles';

export const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetchingHospitals, setFetchingHospitals] = useState(false);
  const [formData, setFormData] = useState({
    hospital_id: '',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '10:00',
    reason: '',
    doctor_name: '',
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadAppointments = async () => {
    try {
      const response = await appointmentApi.getAll();
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyHospitals = async () => {
    try {
      setFetchingHospitals(true);
      const hasPermission = await Location.requestForegroundPermissionsAsync();
      if (hasPermission.status === 'granted') {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const response = await hospitalApi.getNearby(location.coords.latitude, location.coords.longitude);
        setHospitals(response.data.hospitals);
      } else {
        Alert.alert('Permission Required', 'Location permission needed to find nearby hospitals');
      }
    } catch (error) {
      console.error('Failed to load hospitals:', error);
    } finally {
      setFetchingHospitals(false);
    }
  };

  const openAddDialog = () => {
    setEditingAppointment(null);
    setFormData({
      hospital_id: '',
      appointment_date: format(new Date(), 'yyyy-MM-dd'),
      appointment_time: '10:00',
      reason: '',
      doctor_name: '',
    });
    loadNearbyHospitals();
    setShowDialog(true);
  };

  const openEditDialog = (appointment: any) => {
    setEditingAppointment(appointment);
    setFormData({
      hospital_id: appointment.hospital_id || '',
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      reason: appointment.reason || '',
      doctor_name: appointment.doctor_name || '',
    });
    loadNearbyHospitals();
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.hospital_id || !formData.appointment_date || !formData.appointment_time) {
      Alert.alert('Error', 'Please select hospital, date, and time');
      return;
    }
    
    setSaving(true);
    try {
      if (editingAppointment) {
        await appointmentApi.update(editingAppointment.id, formData);
        setSnackbarMessage('Appointment updated successfully');
      } else {
        await appointmentApi.create(formData);
        setSnackbarMessage('Appointment booked successfully');
      }
      setSnackbarVisible(true);
      setShowDialog(false);
      loadAppointments();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save appointment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await appointmentApi.delete(id);
              loadAppointments();
              setSnackbarMessage('Appointment cancelled');
              setSnackbarVisible(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          } 
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#2E7D32';
      case 'pending': return '#E65100';
      case 'completed': return '#1565C0';
      case 'cancelled': return '#C62828';
      default: return '#666666';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  const upcomingAppointments = appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Title style={styles.headerTitle}>Appointments</Title>
          <Text style={styles.headerSubtitle}>{upcomingAppointments.length} upcoming</Text>
        </View>
        <Button mode="contained" onPress={openAddDialog} style={styles.addButton} icon="plus">
          <Text style={styles.addButtonText}>Book</Text>
        </Button>
      </View>

      {upcomingAppointments.length === 0 && pastAppointments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No appointments yet</Text>
          <Text style={styles.emptySubtitle}>Tap "Book" to schedule your first appointment</Text>
          <Button mode="contained" onPress={openAddDialog} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Book Appointment</Text>
          </Button>
        </View>
      ) : (
        <View style={styles.list}>
          {upcomingAppointments.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              {upcomingAppointments.map(apt => (
                <Card key={apt.id} style={styles.aptCard} elevation={2}>
                  <Card.Content style={styles.aptCardContent}>
                    <View style={styles.aptHeader}>
                      <View style={styles.aptInfo}>
                        <Text style={styles.aptHospital}>{apt.hospital_name || 'Hospital'}</Text>
                        <Text style={styles.aptDoctor}>{apt.doctor_name || 'General Consultation'}</Text>
                      </View>
                      <TouchableOpacity onPress={() => openEditDialog(apt)} style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.aptDetails}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailIcon}>📅</Text>
                        <Text style={styles.detailText}>
                          {format(parseISO(apt.appointment_date), 'EEEE, MMM d, yyyy')}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailIcon}>🕐</Text>
                        <Text style={styles.detailText}>
                          {format(parseISO(`2000-01-01T${apt.appointment_time}`), 'h:mm a')}
                        </Text>
                      </View>
                      {apt.reason && (
                        <View style={styles.detailItem}>
                          <Text style={styles.detailIcon}>📝</Text>
                          <Text style={styles.detailText}>{apt.reason}</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.aptFooter}>
                      <Chip
                        style={[styles.statusChip, { backgroundColor: getStatusColor(apt.status) + '20' }]}
                        textStyle={{ color: getStatusColor(apt.status) }}
                      >
                        {getStatusLabel(apt.status)}
                      </Chip>
                      <TouchableOpacity onPress={() => handleDelete(apt.id)} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}
          
          {pastAppointments.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Past Appointments</Text>
              {pastAppointments.map(apt => (
                <Card key={apt.id} style={styles.aptCard} elevation={1}>
                  <Card.Content style={styles.aptCardContent}>
                    <View style={styles.aptHeader}>
                      <View style={styles.aptInfo}>
                        <Text style={styles.aptHospital}>{apt.hospital_name || 'Hospital'}</Text>
                        <Text style={styles.aptDoctor}>{apt.doctor_name || 'General Consultation'}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.aptDetails}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailIcon}>📅</Text>
                        <Text style={styles.detailText}>
                          {format(parseISO(apt.appointment_date), 'EEEE, MMM d, yyyy')}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailIcon}>🕐</Text>
                        <Text style={styles.detailText}>
                          {format(parseISO(`2000-01-01T${apt.appointment_time}`), 'h:mm a')}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.aptFooter}>
                      <Chip
                        style={[styles.statusChip, { backgroundColor: getStatusColor(apt.status) + '20' }]}
                        textStyle={{ color: getStatusColor(apt.status) }}
                      >
                        {getStatusLabel(apt.status)}
                      </Chip>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}
        </View>
      )}

      <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
        <Dialog.Title>{editingAppointment ? 'Edit Appointment' : 'Book Appointment'}</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={styles.dialogContent}>
            {fetchingHospitals ? (
              <View style={styles.loadingHospitals}>
                <ActivityIndicator size="small" color="#2E7D32" />
                <Text style={styles.loadingHospitalsText}>Finding nearby hospitals...</Text>
              </View>
            ) : (
              <View>
                <Text style={styles.fieldLabel}>Select Hospital</Text>
                {hospitals.length === 0 ? (
                  <TouchableOpacity style={styles.noHospitalsButton} onPress={loadNearbyHospitals}>
                    <Text style={styles.noHospitalsText}>No hospitals found. Tap to search again.</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.hospitalList}>
                    {hospitals.map(hospital => (
                      <TouchableOpacity
                        key={hospital.id}
                        style={[
                          styles.hospitalItem,
                          formData.hospital_id === hospital.id && styles.hospitalItemSelected,
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, hospital_id: hospital.id }))}
                      >
                        <View style={styles.hospitalItemInfo}>
                          <Text style={styles.hospitalItemName}>{hospital.name}</Text>
                          <Text style={styles.hospitalItemAddress}>{hospital.address}</Text>
                          {hospital.distance_km && (
                            <Text style={styles.hospitalItemDistance}>{hospital.distance_km.toFixed(1)} km away</Text>
                          )}
                        </View>
                        {formData.hospital_id === hospital.id && (
                          <View style={styles.hospitalItemCheck} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
            
            <View style={styles.dateTimeRow}>
              <TextInput
                label="Appointment Date"
                value={formData.appointment_date}
                onChangeText={v => setFormData(prev => ({ ...prev, appointment_date: v }))}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                editable={false}
              />
              <TextInput
                label="Appointment Time"
                value={formData.appointment_time}
                onChangeText={v => setFormData(prev => ({ ...prev, appointment_time: v }))}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                editable={false}
              />
            </View>
            
            <TextInput
              label="Reason for Visit"
              value={formData.reason}
              onChangeText={v => setFormData(prev => ({ ...prev, reason: v }))}
              mode="outlined"
              style={styles.input}
              multiline
              placeholder="e.g., Routine checkup, Follow-up"
            />
            
            <TextInput
              label="Preferred Doctor (Optional)"
              value={formData.doctor_name}
              onChangeText={v => setFormData(prev => ({ ...prev, doctor_name: v }))}
              mode="outlined"
              style={styles.input}
              placeholder="Doctor name if known"
            />
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowDialog(false)}>Cancel</Button>
          <Button onPress={handleSave} loading={saving}>
            {editingAppointment ? 'Update' : 'Book'}
          </Button>
        </Dialog.Actions>
      </Dialog>

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