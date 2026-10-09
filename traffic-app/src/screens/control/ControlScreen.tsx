import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Chip, Button, Switch } from 'react-native-paper';
import { trafficApi } from '../../services/api';
import styles from './styles';

export const ControlScreen = () => {
  const [signal, setSignal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [nsGreen, setNsGreen] = useState(false);
  const [ewGreen, setEwGreen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSignal = async () => {
    try {
      const response = await trafficApi.getStatus();
      setSignal(response.data.signal);
      setNsGreen(response.data.signal?.north_south_green || false);
      setEwGreen(response.data.signal?.east_west_green || false);
    } catch (error) {
      console.error('Failed to load signal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoModeChange = () => {
    setManualMode(!manualMode);
    if (!manualMode) {
      loadSignal();
    }
  };

  const handleNsChange = (value: boolean) => {
    if (manualMode) {
      setNsGreen(value);
    }
  };

  const handleEwChange = (value: boolean) => {
    if (manualMode) {
      setEwGreen(value);
    }
  };

  const applyManualControl = async () => {
    setSaving(true);
    try {
      await trafficApi.manualControl(nsGreen, ewGreen);
      Alert.alert('Success', 'Signal control updated');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update signal');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSignal();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading signal control...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Manual Control</Title>
        <Text style={styles.headerSubtitle}>
          {manualMode ? 'Manual Override Active' : 'Automatic Mode'}
        </Text>
      </View>

      <Card style={styles.modeCard} elevation={2}>
        <Card.Content style={styles.modeCardContent}>
          <View style={styles.modeRow}>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Control Mode</Text>
              <Text style={styles.modeSubtitle}>
                {manualMode ? 'Manual control of signal lights' : 'Automatic based on ambulance priority'}
              </Text>
            </View>
            <Switch
              value={manualMode}
              onValueChange={handleAutoModeChange}
              disabled={loading}
            />
          </View>
        </Card.Content>
      </Card>

      <View style={styles.controlsSection}>
        <Title style={styles.sectionTitle}>Signal Lights</Title>
        
        <Card style={styles.controlCard} elevation={2}>
          <Card.Content style={styles.controlCardContent}>
            <View style={styles.controlRow}>
              <View style={styles.controlLight}>
                <View style={[
                  styles.bigLight,
                  nsGreen && styles.bigLightGreen,
                ]} />
                <Text style={[
                  styles.controlLabel,
                  nsGreen && styles.controlLabelGreen,
                ]}>
                  NORTH-SOUTH
                </Text>
                <Text style={styles.controlStatus}>
                  {nsGreen ? 'GREEN' : 'RED'}
                </Text>
              </View>
              <Switch
                value={nsGreen}
                onValueChange={handleNsChange}
                disabled={!manualMode}
                style={styles.switch}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.controlCard} elevation={2}>
          <Card.Content style={styles.controlCardContent}>
            <View style={styles.controlRow}>
              <View style={styles.controlLight}>
                <View style={[
                  styles.bigLight,
                  ewGreen && styles.bigLightGreen,
                ]} />
                <Text style={[
                  styles.controlLabel,
                  ewGreen && styles.controlLabelGreen,
                ]}>
                  EAST-WEST
                </Text>
                <Text style={styles.controlStatus}>
                  {ewGreen ? 'GREEN' : 'RED'}
                </Text>
              </View>
              <Switch
                value={ewGreen}
                onValueChange={handleEwChange}
                disabled={!manualMode}
                style={styles.switch}
              />
            </View>
          </Card.Content>
        </Card>

        {manualMode && (
          <View style={styles.applySection}>
            <Button
              mode="contained"
              onPress={applyManualControl}
              loading={saving}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>Apply Changes</Text>
            </Button>
            <Text style={styles.applyWarning}>
              ⚠ Manual control overrides automatic ambulance priority
            </Text>
          </View>
        )}

        {!manualMode && (
          <View style={styles.autoInfo}>
            <Text style={styles.autoInfoText}>
              In automatic mode, signals turn GREEN for approaching ambulances
              based on their direction and distance (< 0.5 km).
            </Text>
          </View>
        )}
      </View>

      {signal && (
        <View style={styles.infoSection}>
          <Card style={styles.infoCard} elevation={2}>
            <Card.Content>
              <Text style={styles.infoTitle}>Signal Status</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Junction Type</Text>
                  <Text style={styles.infoValue}>{signal.junction_type || 'four_way'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Mode</Text>
                  <Text style={styles.infoValue}>
                    {signal.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
};