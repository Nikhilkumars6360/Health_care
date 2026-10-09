import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  statusContainer: {
    paddingHorizontal: 12,
  },
  statusChip: {
    borderRadius: 16,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingTop: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  statusButtonActive: {
    backgroundColor: '#FFF3E0',
    borderColor: '#E65100',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  trackingButton: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  trackingButtonText: {
    fontWeight: '600',
  },
  locationInfo: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationCoords: {
    fontSize: 14,
    color: '#1B5E20',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  emergencySection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  emergencyCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  emergencyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDEDEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyPatient: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emergencyPhone: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  emergencyDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333333',
    width: 120,
  },
  detailValue: {
    fontSize: 13,
    color: '#1A1A1A',
    flex: 1,
  },
  emergencyActions: {
    gap: 8,
  },
  actionButton: {
    borderRadius: 12,
  },
  actionButtonText: {
    fontWeight: '600',
  },
});