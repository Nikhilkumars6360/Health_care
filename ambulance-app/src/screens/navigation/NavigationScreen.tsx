import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card, Title, Chip, Button, Avatar } from 'react-native-paper';
import { ambulanceApi, emergencyApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import styles from './styles';

export const NavigationScreen = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [routeSignals, setRouteSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const loadHospitals = async () => {
    setFetching(true);
    try {
      const response = await ambulanceApi.getNearbyHospitals();
      setHospitals(response.data.hospitals);
    } catch (error) {
      console.error('Failed to load hospitals:', error);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  const startNavigation = async (hospitalId: string) => {
    try {
      const response = await ambulanceApi.navigateToHospital(hospitalId);
      setNavigationStarted(true);
      setRouteSignals(response.data.signals_on_route || []);
      Alert.alert('Navigation Started', `Navigating to ${response.data.hospital.name}`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to start navigation');
    }
  };

  const handleSignalActivated = (signalId: string) => {
    setRouteSignals(prev => prev.map(s => 
      s.signal_id === signalId ? { ...s, signal_activated: true } : s
    ));
  };

  const handleSignalPassed = (signalId: string) => {
    setRouteSignals(prev => prev.map(s => 
      s.signal_id === signalId ? { ...s, passed_signal: true } : s
    ));
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E65100" />
        <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Navigation</Title>
        <Text style={styles.headerSubtitle}>
          {navigationStarted ? 'Active Navigation' : 'Select Destination'}
        </Text>
      </View>

      {!navigationStarted && (
        <View style={styles.hospitalSection}>
          <Title style={styles.sectionTitle}>Nearby Hospitals</Title>
          {fetching ? (
            <View style={styles.loadingHospitals}>
              <ActivityIndicator size="small" color="#E65100" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : hospitals.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyCardContent}>
                <Text style={styles.emptyText}>No hospitals found nearby</Text>
                <Button mode="outlined" onPress={loadHospitals} style={styles.refreshButton}>
                  <Text>Search Again</Text>
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.hospitalList}>
              {hospitals.map(hospital => (
                <TouchableOpacity
                  key={hospital.id}
                  style={[
                    styles.hospitalCard,
                    selectedHospital === hospital.id && styles.hospitalCardSelected,
                  ]}
                  onPress={() => setSelectedHospital(hospital.id)}
                >
                  <View style={styles.hospitalCardInfo}>
                    <Text style={styles.hospitalCardName}>{hospital.name}</Text>
                    <Text style={styles.hospitalCardAddress}>{hospital.address}</Text>
                    {hospital.distance_km && (
                      <View style={styles.hospitalCardMeta}>
                        <Chip style={styles.distanceChip} icon="map-marker">
                          {hospital.distance_km.toFixed(1)} km
                        </Chip>
                      </View>
                    )}
                  </View>
                  {selectedHospital === hospital.id && (
                    <View style={styles.hospitalCardCheck} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {selectedHospital && (
            <Button
              mode="contained"
              icon="navigate"
              onPress={() => startNavigation(selectedHospital!)}
              style={styles.startNavButton}
            >
              <Text style={styles.startNavButtonText}>Start Navigation</Text>
            </Button>
          )}
        </View>
      )}

      {navigationStarted && (
        <View style={styles.activeNavSection}>
          <Card style={styles.activeNavCard} elevation={4}>
            <Card.Content>
              <View style={styles.activeNavHeader}>
                <View style={styles.activeNavIcon} />
                <View style={styles.activeNavInfo}>
                  <Text style={styles.activeNavTitle}>Navigation Active</Text>
                  <Text style={styles.activeNavSubtitle}>
                    Following route with traffic signal priority
                  </Text>
                </View>
              </View>
              
              <View style={styles.signalsList}>
                {routeSignals.map((signal, index) => (
                  <View key={signal.signal_id} style={styles.signalItem}>
                    <View style={[
                      styles.signalStatusIndicator,
                      signal.passed_signal && styles.signalPassed,
                      signal.signal_activated && !signal.passed_signal && styles.signalActive,
                    ]} />
                    <View style={styles.signalInfo}>
                      <Text style={styles.signalNumber}>Signal #{index + 1}</Text>
                      <Text style={styles.signalDirection}>
                        Direction: {signal.direction}
                      </Text>
                      <Text style={styles.signalDistance}>
                        {signal.distance_to_signal?.toFixed(2)} km away
                      </Text>
                    </View>
                    <View style={styles.signalActions}>
                      {!signal.signal_activated && !signal.passed_signal && (
                        <Button mode="outlined" onPress={() => handleSignalActivated(signal.signal_id)} style={styles.signalButton}>
                          <Text style={styles.signalButtonText}>Activate</Text>
                        </Button>
                      )}
                      {signal.signal_activated && !signal.passed_signal && (
                        <Button mode="contained" onPress={() => handleSignalPassed(signal.signal_id)} style={styles.signalButtonPassed}>
                          <Text style={styles.signalButtonText}>Passed</Text>
                        </Button>
                      )}
                      {signal.passed_signal && (
                        <Chip style={styles.passedChip} color="#2E7D32" textColor="#FFFFFF">
                          Passed
                        </Chip>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              
              <Button
                mode="outlined"
                onPress={() => {
                  setNavigationStarted(false);
                  setSelectedHospital(null);
                  setRouteSignals([]);
                }}
                style={styles.endNavButton}
              >
                <Text style={styles.endNavButtonText}>End Navigation</Text>
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
};