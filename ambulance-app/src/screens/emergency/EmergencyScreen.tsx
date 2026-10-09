import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Card, Title, Chip, Button, Avatar } from 'react-native-paper';
import { emergencyApi, ambulanceApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import styles from './styles';

export const EmergencyScreen = () => {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEmergencies = async () => {
    try {
      const response = await emergencyApi.getMyEmergencies();
      setEmergencies(response.data.emergencies);
    } catch (error) {
      console.error('Failed to load emergencies:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEmergencies();
  };

  const handleStatusUpdate = async (emergencyId: string, newStatus: string) => {
    try {
      await emergencyApi.updateStatus(emergencyId, newStatus);
      setEmergencies(prev => prev.map(e => 
        e.id === emergencyId ? { ...e, status: newStatus } : e
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleAssignHospital = async (emergencyId: string) => {
    Alert.alert('Assign Hospital', 'This feature requires hospital selection from the Navigation tab');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#E65100';
      case 'assigned': return '#1565C0';
      case 'en_route': return '#E65100';
      case 'arrived': return '#2E7D32';
      case 'completed': return '#1565C0';
      case 'cancelled': return '#757575';
      default: return '#666666';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  useEffect(() => {
    loadEmergencies();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E65100" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <View style={styles.refreshControl}>
          <ActivityIndicator size="small" color="#E65100" animating={refreshing} />
        </View>
      }
      onRefresh={handleRefresh}
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Emergency History</Title>
        <Text style={styles.headerSubtitle}>{emergencies.length} total requests</Text>
      </View>

      {emergencies.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚑</Text>
          <Text style={styles.emptyTitle}>No emergency requests</Text>
          <Text style={styles.emptySubtitle}>Your emergency history will appear here</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {emergencies.map(emg => (
            <Card key={emg.id} style={styles.emgCard} elevation={2}>
              <Card.Content style={styles.emgCardContent}>
                <View style={styles.emgHeader}>
                  <View style={styles.emgStatusContainer}>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(emg.status) + '20' }]}
                      textStyle={{ color: getStatusColor(emg.status) }}
                    >
                      {getStatusLabel(emg.status)}
                    </Chip>
                  </View>
                  <Text style={styles.emgDate}>
                    {format(parseISO(emg.created_at), 'MMM d, yyyy h:mm a')}
                  </Text>
                </View>

                <View style={styles.emgPatient}>
                  <Text style={styles.emgPatientName}>
                    {emg.patient_details?.name || 'Unknown Patient'}
                  </Text>
                  <Text style={styles.emgPatientPhone}>
                    {emg.patient_details?.phone || ''}
                  </Text>
                </View>

                {emg.address && (
                  <Text style={styles.emgAddress}>📍 {emg.address}</Text>
                )}

                <View style={styles.emgDetails}>
                  {emg.patient_details?.blood_group && (
                    <Chip style={styles.detailChip} icon="drop">
                      {emg.patient_details.blood_group}
                    </Chip>
                  )}
                  {emg.ambulance && (
                    <Chip style={styles.detailChip} icon="ambulance">
                      {emg.ambulance.vehicle_number}
                    </Chip>
                  )}
                  {emg.hospital && (
                    <Chip style={styles.detailChip} icon="hospital">
                      {emg.hospital.name}
                    </Chip>
                  )}
                </View>

                {['assigned', 'en_route'].includes(emg.status) && (
                  <View style={styles.emgActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleStatusUpdate(emg.id, 
                        emg.status === 'assigned' ? 'en_route' : 'arrived'
                      )}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>
                        {emg.status === 'assigned' ? 'Start Response' : 'Mark Arrived'}
                      </Text>
                    </Button>
                    {emg.status === 'en_route' && !emg.hospital_id && (
                      <Button
                        mode="outlined"
                        onPress={() => handleAssignHospital(emg.id)}
                        style={styles.actionButtonSecondary}
                      >
                        <Text style={styles.actionButtonText}>Assign Hospital</Text>
                      </Button>
                    )}
                  </View>
                )}

                {emg.status === 'arrived' && (
                  <View style={styles.emgActions}>
                    <Button
                      mode="contained"
                      onPress={() => handleStatusUpdate(emg.id, 'completed')}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>Complete & Transport</Text>
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
};