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
  medCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  medCardContent: {
    padding: 20,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  medDosage: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    marginTop: 2,
  },
  medActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1565C0',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FDEDEC',
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C62828',
  },
  medDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detailChip: {
    backgroundColor: '#E8F5E9',
  },
  timeChip: {
    backgroundColor: '#E3F2FD',
  },
  instructions: {
    fontSize: 13,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  medFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  dialogContent: {
    maxHeight: 500,
  },
  input: {
    marginBottom: 16,
  },
  frequencyContainer: {
    marginBottom: 16,
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 12,
  },
  frequencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
  },
  frequencyButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  frequencyButtonText: {
    fontSize: 13,
    color: '#333333',
  },
  frequencyButtonTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  timesContainer: {
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  removeTimeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FDEDEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeTimeButtonText: {
    fontSize: 16,
    color: '#C62828',
  },
  addTimeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  addTimeButtonText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
  },
  snackbar: {
    backgroundColor: '#1A1A1A',
  },
});