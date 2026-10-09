import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { Button, TextInput, Card, Title, Chip, Dialog, Snackbar, ActivityIndicator } from 'react-native-paper';
import { reportApi } from '../../services/api';
import * as DocumentPicker from 'expo-document-picker';
import { format, parseISO } from 'date-fns';
import styles from './styles';

export const ReportsScreen = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: '',
    report_date: format(new Date(), 'yyyy-MM-dd'),
    hospital_name: '',
    doctor_name: '',
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadReports = async () => {
    try {
      const response = await reportApi.getAll();
      setReports(response.data.reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFormData(prev => ({
          ...prev,
          file_url: asset.uri,
          file_type: asset.mimeType || '',
        }));
        setSnackbarMessage('File selected. Please save to upload.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Document picker error:', error);
    }
  };

  const openAddDialog = () => {
    setEditingReport(null);
    setFormData({
      title: '',
      description: '',
      file_url: '',
      file_type: '',
      report_date: format(new Date(), 'yyyy-MM-dd'),
      hospital_name: '',
      doctor_name: '',
    });
    setShowDialog(true);
  };

  const openEditDialog = (report: any) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      description: report.description || '',
      file_url: report.file_url || '',
      file_type: report.file_type || '',
      report_date: report.report_date,
      hospital_name: report.hospital_name || '',
      doctor_name: report.doctor_name || '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    setSaving(true);
    try {
      if (editingReport) {
        await reportApi.update(editingReport.id, formData);
        setSnackbarMessage('Report updated successfully');
      } else {
        await reportApi.create(formData);
        setSnackbarMessage('Report added successfully');
      }
      setSnackbarVisible(true);
      setShowDialog(false);
      loadReports();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await reportApi.delete(id);
              loadReports();
              setSnackbarMessage('Report deleted');
              setSnackbarVisible(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete report');
            }
          } 
        },
      ]
    );
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📎';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Title style={styles.headerTitle}>Medical Reports</Title>
          <Text style={styles.headerSubtitle}>{reports.length} report{reports.length !== 1 ? 's' : ''} stored</Text>
        </View>
        <Button mode="contained" onPress={openAddDialog} style={styles.addButton} icon="plus">
          <Text style={styles.addButtonText}>Add</Text>
        </Button>
      </View>

      {reports.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>No reports yet</Text>
          <Text style={styles.emptySubtitle}>Tap "Add" to upload your first medical report</Text>
          <Button mode="contained" onPress={openAddDialog} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Add Report</Text>
          </Button>
        </View>
      ) : (
        <View style={styles.list}>
          {reports.map(report => (
            <Card key={report.id} style={styles.reportCard} elevation={2}>
              <Card.Content style={styles.reportCardContent}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportIcon}>
                    <Text style={styles.reportIconText}>{getFileIcon(report.file_type || '')}</Text>
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportDate}>
                      {format(parseISO(report.report_date), 'MMM d, yyyy')}
                      {report.hospital_name && ` • ${report.hospital_name}`}
                    </Text>
                  </View>
                  <View style={styles.reportActions}>
                    <TouchableOpacity onPress={() => openEditDialog(report)} style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(report.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {report.description && (
                  <Text style={styles.reportDescription}>{report.description}</Text>
                )}
                
                <View style={styles.reportFooter}>
                  {report.doctor_name && (
                    <Text style={styles.footerText}>Doctor: {report.doctor_name}</Text>
                  )}
                  {report.file_type && (
                    <Chip style={styles.fileTypeChip} icon="file-outline">
                      {report.file_type}
                    </Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
        <Dialog.Title>{editingReport ? 'Edit Report' : 'Add Report'}</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={styles.dialogContent}>
            <TextInput
              label="Title"
              value={formData.title}
              onChangeText={v => setFormData(prev => ({ ...prev, title: v }))}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={v => setFormData(prev => ({ ...prev, description: v }))}
              mode="outlined"
              style={styles.input}
              multiline
              placeholder="Brief description of the report"
            />
            
            <View style={styles.fileSection}>
              <Text style={styles.fileLabel}>Attach File</Text>
              <TouchableOpacity style={[styles.fileButton, formData.file_url && styles.fileButtonHasFile]} onPress={pickDocument}>
                <Text style={styles.fileButtonText}>
                  {formData.file_url ? '✓ File selected (tap to change)' : '📎 Choose File'}
                </Text>
              </TouchableOpacity>
              {formData.file_url && (
                <Text style={styles.fileSelected}>Ready to upload</Text>
              )}
            </View>
            
            <View style={styles.dateRow}>
              <TextInput
                label="Report Date"
                value={formData.report_date}
                onChangeText={v => setFormData(prev => ({ ...prev, report_date: v }))}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                editable={false}
              />
            </View>
            
            <TextInput
              label="Hospital Name"
              value={formData.hospital_name}
              onChangeText={v => setFormData(prev => ({ ...prev, hospital_name: v }))}
              mode="outlined"
              style={styles.input}
              placeholder="Hospital or clinic name"
            />
            
            <TextInput
              label="Doctor Name"
              value={formData.doctor_name}
              onChangeText={v => setFormData(prev => ({ ...prev, doctor_name: v }))}
              mode="outlined"
              style={styles.input}
              placeholder="Prescribing doctor"
            />
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowDialog(false)}>Cancel</Button>
          <Button onPress={handleSave} loading={saving}>
            {editingReport ? 'Update' : 'Add'}
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