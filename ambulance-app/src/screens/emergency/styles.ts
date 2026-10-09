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
  refreshControl: {
    paddingVertical: 12,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
  emgCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  emgCardContent: {
    padding: 20,
  },
  emgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emgStatusContainer: {
    flex: 1,
  },
  statusChip: {
    borderRadius: 16,
  },
  emgDate: {
    fontSize: 12,
    color: '#888888',
  },
  emgPatient: {
    marginBottom: 12,
  },
  emgPatientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emgPatientPhone: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  emgAddress: {
    fontSize: 13,
    color: '#333333',
    marginBottom: 12,
    lineHeight: 20,
  },
  emgDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  detailChip: {
    backgroundColor: '#E8F5E9',
  },
  emgActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  actionButtonSecondary: {
    flex: 1,
    borderRadius: 12,
  },
  actionButtonText: {
    fontWeight: '600',
  },
});