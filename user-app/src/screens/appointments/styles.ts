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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
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
  addButton: {
    paddingHorizontal: 16,
  },
  addButtonText: {
    fontWeight: '600',
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
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    marginTop: 8,
    paddingLeft: 4,
  },
  aptCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  aptCardContent: {
    padding: 20,
  },
  aptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  aptInfo: {
    flex: 1,
  },
  aptHospital: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  aptDoctor: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1565C0',
  },
  aptDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
  },
  detailText: {
    fontSize: 14,
    color: '#333333',
  },
  aptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statusChip: {
    borderRadius: 16,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FDEDEC',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C62828',
  },
  dialogContent: {
    maxHeight: 500,
  },
  loadingHospitals: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  loadingHospitalsText: {
    fontSize: 14,
    color: '#666666',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 12,
    marginTop: 8,
  },
  noHospitalsButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  noHospitalsText: {
    fontSize: 14,
    color: '#666666',
  },
  hospitalList: {
    maxHeight: 300,
  },
  hospitalItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  hospitalItemSelected: {
    borderColor: '#2E7D32',
    borderWidth: 2,
    backgroundColor: '#E8F5E9',
  },
  hospitalItemInfo: {
    flex: 1,
  },
  hospitalItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  hospitalItemAddress: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  hospitalItemDistance: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
    marginTop: 4,
  },
  hospitalItemCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
  },
  input: {
    marginBottom: 16,
  },
  snackbar: {
    backgroundColor: '#1A1A1A',
  },
});