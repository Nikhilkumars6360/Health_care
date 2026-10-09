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
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  hospitalSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  loadingHospitals: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  emptyCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  emptyCardContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
  },
  refreshButton: {
    marginTop: 8,
  },
  hospitalList: {
    gap: 12,
  },
  hospitalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  hospitalCardSelected: {
    borderColor: '#E65100',
    borderWidth: 2,
    backgroundColor: '#FFF3E0',
  },
  hospitalCardInfo: {
    flex: 1,
  },
  hospitalCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  hospitalCardAddress: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  hospitalCardMeta: {
    marginTop: 8,
  },
  distanceChip: {
    backgroundColor: '#E3F2FD',
  },
  hospitalCardCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E65100',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startNavButton: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  startNavButtonText: {
    fontWeight: '600',
  },
  activeNavSection: {
    paddingHorizontal: 16,
  },
  activeNavCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  activeNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activeNavIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNavInfo: {
    flex: 1,
  },
  activeNavTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  activeNavSubtitle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  signalsList: {
    gap: 12,
  },
  signalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
  },
  signalStatusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  signalActive: {
    backgroundColor: '#E65100',
  },
  signalPassed: {
    backgroundColor: '#2E7D32',
  },
  signalInfo: {
    flex: 1,
  },
  signalNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  signalDirection: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  signalDistance: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  signalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  signalButton: {
    paddingHorizontal: 12,
  },
  signalButtonPassed: {
    paddingHorizontal: 12,
  },
  signalButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  passedChip: {
    borderRadius: 12,
  },
  endNavButton: {
    marginTop: 16,
    borderRadius: 12,
  },
  endNavButtonText: {
    fontWeight: '600',
    color: '#C62828',
  },
});