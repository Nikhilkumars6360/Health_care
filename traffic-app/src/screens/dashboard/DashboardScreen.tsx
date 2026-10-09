import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, Title, Chip, Button, Avatar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { trafficApi } from '../../services/api';
import styles from './styles';

export const DashboardScreen = () => {
  const { user } = useAuth();
  const [signal, setSignal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approachingAmbulances, setApproachingAmbulances] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [signalRes, statusRes] = await Promise.all([
        trafficApi.getProfile(),
        trafficApi.getStatus(),
      ]);
      setSignal(signalRes.data.signal);
      setApproachingAmbulances(statusRes.data.approaching_ambulances || []);
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
        <Text style={styles.loadingText}>Loading signal status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Title style={styles.signalName}>{signal?.name || 'Traffic Signal'}</Title>
          <Text style={styles.signalId}>ID: {signal?.signal_id || ''}</Text>
        </View>
        <Avatar.Icon size={56} icon="traffic-light" style={styles.avatar} />
      </View>

      <View style={styles.statusCards}>
        <Card style={styles.statusCard}>
          <Card.Content style={styles.statusCardContent}>
            <Text style={styles.statusLabel}>North-South</Text>
            <View style={styles.lightContainer}>
              <View style={[
                styles.trafficLight,
                signal?.north_south_green && styles.trafficLightGreen,
              ]} />
              <Text style={[
                styles.lightStatus,
                signal?.north_south_green && styles.lightStatusGreen,
              ]}>
                {signal?.north_south_green ? 'GREEN' : 'RED'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statusCard}>
          <Card.Content style={styles.statusCardContent}>
            <Text style={styles.statusLabel}>East-West</Text>
            <View style={styles.lightContainer}>
              <View style={[
                styles.trafficLight,
                signal?.east_west_green && styles.trafficLightGreen,
              ]} />
              <Text style={[
                styles.lightStatus,
                signal?.east_west_green && styles.lightStatusGreen,
              ]}>
                {signal?.east_west_green ? 'GREEN' : 'RED'}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {approachingAmbulances.length > 0 && (
        <View style={styles.ambulanceSection}>
          <Title style={styles.sectionTitle}>Approaching Ambulances</Title>
          <View style={styles.ambulanceList}>
            {approachingAmbulances.map((amb: any) => (
              <Card key={amb.ambulance_id} style={styles.ambulanceCard} elevation={3}>
                <Card.Content>
                  <View style={styles.ambulanceHeader}>
                    <View style={styles.ambulanceIcon} />
                    <View style={styles.ambulanceInfo}>
                      <Text style={styles.ambulanceVehicle}>{amb.vehicle_number}</Text>
                      <Text style={styles.ambulanceDriver}>{amb.driver_name}</Text>
                    </View>
                    <View style={styles.ambulanceMeta}>
                      <Chip style={styles.directionChip}>
                        {amb.direction}
                      </Chip>
                      <Chip style={styles.distanceChip}>
                        {amb.distance_km?.toFixed(2)} km
                      </Chip>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>
      )}

      <View style={styles.infoSection}>
        <Card style={styles.infoCard} elevation={2}>
          <Card.Content>
            <Text style={styles.infoTitle}>Signal Information</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Junction Type</Text>
                <Text style={styles.infoValue}>{signal?.junction_type || 'four_way'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{signal?.is_active ? 'Active' : 'Inactive'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>
                  {signal?.latitude?.toFixed(6)}, {signal?.longitude?.toFixed(6)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};