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
  hospitalName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  avatar: {
    backgroundColor: '#E3F2FD',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1565C0',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emergencyBadge: {
    borderRadius: 16,
  },
  emergencyList: {
    gap: 12,
  },
  emergencyCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDEDEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emergencyDetails: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  statusChip: {
    borderRadius: 16,
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
  },
  appointmentList: {
    gap: 12,
  },
  appointmentCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appointmentTime: {
    width: 70,
    alignItems: 'center',
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  appointmentTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
  },
  appointmentInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  appointmentPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  appointmentReason: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
});