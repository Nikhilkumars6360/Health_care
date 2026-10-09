import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchCard: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  searchCardContent: {
    padding: 20,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  searchButton: {
    marginTop: 8,
  },
  searchButtonText: {
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
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
  patientList: {
    gap: 12,
  },
  patientCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  patientCardContent: {
    padding: 0,
  },
  patientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  patientContact: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  patientMeta: {
    alignItems: 'flex-end',
  },
  bloodGroupChip: {
    backgroundColor: '#E3F2FD',
  },
  modal: {
    width: '95%',
    maxHeight: '90%',
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666666',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#1565C0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  tabTextActive: {
    color: '#1565C0',
    fontWeight: '600',
  },
  tabContent: {
    maxHeight: 400,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  emptyTab: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTabText: {
    fontSize: 14,
    color: '#888888',
  },
  medList: {
    gap: 8,
    marginBottom: 16,
  },
  medItem: {
    borderRadius: 12,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  medDosage: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  medTimes: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  reportList: {
    gap: 8,
    marginBottom: 16,
  },
  reportItem: {
    borderRadius: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reportDate: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  aptList: {
    gap: 8,
  },
  aptItem: {
    borderRadius: 12,
  },
  aptDate: {
    fontSize: 14,
    color: '#333333',
  },
  aptStatus: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  addButtonText: {
    fontWeight: '600',
  },
  snackbar: {
    backgroundColor: '#1A1A1A',
  },
});