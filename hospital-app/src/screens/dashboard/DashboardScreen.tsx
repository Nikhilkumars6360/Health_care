import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip, Button, Avatar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { hospitalApi, appointmentApi, emergencyApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import styles from './styles';

export const DashboardScreen = () => {
  const { user } = useAuth();
  const [hospital, setHospital] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [activeEmergencies, setActiveEmergencies] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    activeEmergencies: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [hospitalRes, appointmentsRes, emergenciesRes] = await Promise.all([
        hospitalApi.getProfile(),
        appointmentApi.getAll(),
        emergencyApi.getMyEmergencies(),
      ]);
      
      setHospital(hospitalRes.data.hospital);
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayApts = appointmentsRes.data.appointments.filter(
        (a: any) => a.appointment_date === today && a.status !== 'cancelled'
      );
      setTodayAppointments(todayApts);
      
      const activeEmgs = emergenciesRes.data.emergencies.filter(
        (e: any) => ['assigned', 'en_route', 'arrived'].includes(e.status)
      );
      setActiveEmergencies(activeEmgs);
      
      setStats({
        totalPatients: 0,
        todayAppointments: todayApts.length,
        activeEmergencies: activeEmgs.length,
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#2E7D32';
      case 'pending': return '#E65100';
      case 'completed': return '#1565C0';
      default: return '#666666';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Title style={styles.hospitalName}>{hospital?.name || 'Hospital'}</Title>
          <Text style={styles.hospitalAddress}>{hospital?.address || ''}</Text>
        </View>
        <Avatar.Icon size={56} icon="hospital" style={styles.avatar} />
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{stats.todayAppointments}</Text>
            <Text style={styles.statLabel}>Today's Appointments</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{stats.activeEmergencies}</Text>
            <Text style={styles.statLabel}>Active Emergencies</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{stats.totalPatients}</Text>
            <Text style={styles.statLabel}>Registered Patients</Text>
          </Card.Content>
        </Card>
      </View>

      {activeEmergencies.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Active Emergencies</Title>
            <Chip style={styles.emergencyBadge} color="#C62828" textColor="#FFFFFF">
              {activeEmergencies.length} Active
            </Chip>
          </View>
          <View style={styles.emergencyList}>
            {activeEmergencies.map(emg => (
              <Card key={emg.id} style={styles.emergencyCard} elevation={3}>
                <Card.Content>
                  <View style={styles.emergencyHeader}>
                    <View style={styles.emergencyIcon} />
                    <View style={styles.emergencyInfo}>
                      <Text style={styles.emergencyPatient}>
                        {emg.patient_details?.name || 'Unknown Patient'}
                      </Text>
                      <Text style={styles.emergencyDetails}>
                        {emg.ambulance ? `Ambulance: ${emg.ambulance.vehicle_number}` : 'Waiting for ambulance'}
                      </Text>
                    </View>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(emg.status) + '20' }]}
                      textStyle={{ color: getStatusColor(emg.status) }}
                    >
                      {emg.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Today's Appointments</Title>
        {todayAppointments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyCardContent}>
              <Text style={styles.emptyText}>No appointments scheduled for today</Text>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.appointmentList}>
            {todayAppointments.map(apt => (
              <Card key={apt.id} style={styles.appointmentCard} elevation={2}>
                <Card.Content>
                  <View style={styles.appointmentRow}>
                    <View style={styles.appointmentTime}>
                      <Text style={styles.appointmentTimeText}>
                        {format(parseISO(`2000-01-01T${apt.appointment_time}`), 'h:mm a')}
                      </Text>
                    </View>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentPatient}>
                        {apt.user_first_name} {apt.user_last_name}
                      </Text>
                      <Text style={styles.appointmentReason}>{apt.reason || 'General consultation'}</Text>
                    </View>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(apt.status) + '20' }]}
                      textStyle={{ color: getStatusColor(apt.status) }}
                    >
                      {apt.status.toUpperCase()}
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};