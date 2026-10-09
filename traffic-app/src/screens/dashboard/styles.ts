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
  loadingText: {
    fontSize: 16,
    color: '#666666',
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
  signalName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  signalId: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  avatar: {
    backgroundColor: '#F3E5F5',
  },
  statusCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  statusCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  statusCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  lightContainer: {
    alignItems: 'center',
    gap: 12,
  },
  trafficLight: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333333',
    borderWidth: 4,
    borderColor: '#1A1A1A',
  },
  trafficLightGreen: {
    backgroundColor: '#2E7D32',
    borderColor: '#1B5E20',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  lightStatus: {
    fontSize: 18,
    fontWeight: '700',
    color: '#757575',
  },
  lightStatusGreen: {
    color: '#2E7D32',
  },
  ambulanceSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  ambulanceList: {
    gap: 12,
  },
  ambulanceCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  ambulanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ambulanceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambulanceInfo: {
    flex: 1,
  },
  ambulanceVehicle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  ambulanceDriver: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  ambulanceMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  directionChip: {
    backgroundColor: '#E3F2FD',
  },
  distanceChip: {
    backgroundColor: '#E8F5E9',
  },
  infoSection: {
    paddingHorizontal: 16,
  },
  infoCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    minWidth: 120,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1A1A1A',
  },
});