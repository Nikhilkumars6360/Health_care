import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Button, TextInput, Card, Title, Chip, Dialog, Snackbar } from 'react-native-paper';
import { hospitalApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import styles from './styles';

export const PatientsScreen = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showPatientDetail, setShowPatientDetail] = useState<any | null>(null);
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const searchPatients = async () => {
    if (!searchName.trim() && !searchPhone.trim()) {
      Alert.alert('Search Required', 'Please enter name or phone number to search');
      return;
    }
    setSearchLoading(true);
    try {
      const response = await hospitalApi.searchPatients(searchName, searchPhone);
      setPatients(response.data.patients);
      setSnackbarMessage(`Found ${response.data.patients.length} patient(s)`);
      setSnackbarVisible(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const loadPatientDetails = async (userId: string) => {
    try {
      const response = await hospitalApi.getPatientDetails(userId);
      setShowPatientDetail(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load patient details');
    }
  };

  const handleAddMedication = async (userId: string, medicationData: any) => {
    try {
      await hospitalApi.addMedication(userId, medicationData);
      setSnackbarMessage('Medication added to patient');
      setSnackbarVisible(true);
      loadPatientDetails(userId);
    } catch (error) {
      Alert.alert('Error', 'Failed to add medication');
    }
  };

  const handleAddReport = async (userId: string, reportData: any) => {
    try {
      await hospitalApi.addReport(userId, reportData);
      setSnackbarMessage('Report added to patient');
      setSnackbarVisible(true);
      loadPatientDetails(userId);
    } catch (error) {
      Alert.alert('Error', 'Failed to add report');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.searchCard} elevation={2}>
        <Card.Content style={styles.searchCardContent}>
          <Title style={styles.searchTitle}>Search Patients</Title>
          
          <TextInput
            label="Patient Name"
            value={searchName}
            onChangeText={setSearchName}
            mode="outlined"
            style={styles.searchInput}
            placeholder="Enter patient name"
          />
          
          <TextInput
            label="Phone Number"
            value={searchPhone}
            onChangeText={setSearchPhone}
            mode="outlined"
            style={styles.searchInput}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
          
          <Button
            mode="contained"
            onPress={searchPatients}
            loading={searchLoading}
            style={styles.searchButton}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </Button>
        </Card.Content>
      </Card>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {patients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No patients found</Text>
            <Text style={styles.emptySubtitle}>Search by name or phone number</Text>
          </View>
        ) : (
          <View style={styles.patientList}>
            {patients.map(patient => (
              <Card key={patient.id} style={styles.patientCard} elevation={2}>
                <Card.Content style={styles.patientCardContent}>
                  <TouchableOpacity
                    style={styles.patientRow}
                    onPress={() => loadPatientDetails(patient.id)}
                  >
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>
                        {patient.first_name} {patient.last_name}
                      </Text>
                      <Text style={styles.patientContact}>
                        {patient.email} • {patient.phone}
                      </Text>
                    </View>
                    <View style={styles.patientMeta}>
                      {patient.blood_group && (
                        <Chip style={styles.bloodGroupChip}>
                          {patient.blood_group}
                        </Chip>
                      )}
                    </View>
                  </TouchableOpacity>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {showPatientDetail && (
        <PatientDetailModal
          patient={showPatientDetail}
          onClose={() => setShowPatientDetail(null)}
          onAddMedication={(data) => handleAddMedication(showPatientDetail.patient.id, data)}
          onAddReport={(data) => handleAddReport(showPatientDetail.patient.id, data)}
        />
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

const PatientDetailModal = ({ patient, onClose, onAddMedication, onAddReport }: any) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [medForm, setMedForm] = useState({
    name: '',
    dosage: '',
    frequency_per_day: 1,
    times_per_day: ['08:00'],
    instructions: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    prescribed_by: '',
  });
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    report_date: format(new Date(), 'yyyy-MM-dd'),
    doctor_name: '',
  });

  const p = patient.patient;

  return (
    <Dialog visible={true} onDismiss={onClose} style={styles.modal}>
      <Dialog.Title>
        <View style={styles.modalTitleRow}>
          <Text style={styles.modalTitle}>{p.first_name} {p.last_name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Dialog.Title>
      <Dialog.Content>
        <View style={styles.tabs}>
          {['profile', 'medications', 'reports', 'appointments'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {activeTab === 'profile' && (
          <ScrollView style={styles.tabContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Contact</Text>
              <Text style={styles.detailValue}>{p.email}</Text>
              <Text style={styles.detailValue}>{p.phone}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Medical Info</Text>
              <Text style={styles.detailValue}>Blood Group: {p.blood_group || 'Not set'}</Text>
              <Text style={styles.detailValue}>Conditions: {p.diseases?.join(', ') || 'None'}</Text>
              <Text style={styles.detailValue}>Allergies: {p.allergies?.join(', ') || 'None'}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Emergency Contact</Text>
              <Text style={styles.detailValue}>
                {p.emergency_contact_name ? `${p.emergency_contact_name} (${p.emergency_contact_relationship})` : 'Not set'}
              </Text>
              <Text style={styles.detailValue}>{p.emergency_contact_phone || 'Not set'}</Text>
            </View>
          </ScrollView>
        )}
        
        {activeTab === 'medications' && (
          <View style={styles.tabContent}>
            {patient.medications.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>No medications prescribed</Text>
              </View>
            ) : (
              <View style={styles.medList}>
                {patient.medications.map((med: any) => (
                  <Card key={med.id} style={styles.medItem} elevation={1}>
                    <Card.Content>
                      <Text style={styles.medName}>{med.name}</Text>
                      <Text style={styles.medDosage}>{med.dosage} • {med.frequency_per_day}x daily</Text>
                      <Text style={styles.medTimes}>
                        {med.times_per_day.map((t: string) => format(parseISO(`2000-01-01T${t}`), 'h:mm a')).join(', ')}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => setShowMedicationDialog(true)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add Medication</Text>
            </Button>
          </View>
        )}
        
        {activeTab === 'reports' && (
          <View style={styles.tabContent}>
            {patient.reports.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>No reports uploaded</Text>
              </View>
            ) : (
              <View style={styles.reportList}>
                {patient.reports.map((report: any) => (
                  <Card key={report.id} style={styles.reportItem} elevation={1}>
                    <Card.Content>
                      <Text style={styles.reportTitle}>{report.title}</Text>
                      <Text style={styles.reportDate}>
                        {format(parseISO(report.report_date), 'MMM d, yyyy')}
                        {report.hospital_name && ` • ${report.hospital_name}`}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => setShowReportDialog(true)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add Report</Text>
            </Button>
          </View>
        )}
        
        {activeTab === 'appointments' && (
          <View style={styles.tabContent}>
            {patient.appointments.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>No appointments</Text>
              </View>
            ) : (
              <View style={styles.aptList}>
                {patient.appointments.map((apt: any) => (
                  <Card key={apt.id} style={styles.aptItem} elevation={1}>
                    <Card.Content>
                      <Text style={styles.aptDate}>
                        {format(parseISO(apt.appointment_date), 'MMM d, yyyy')} at {format(parseISO(`2000-01-01T${apt.appointment_time}`), 'h:mm a')}
                      </Text>
                      <Text style={styles.aptStatus}>{apt.status}</Text>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </View>
        )}
      </Dialog.Content>
      
      <Dialog.Actions>
        <Button onPress={onClose}>Close</Button>
      </Dialog.Actions>
    </Dialog>
  );
};