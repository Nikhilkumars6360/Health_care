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
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    backgroundColor: '#E8F5E9',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  email: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  phone: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  card: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  input: {
    marginBottom: 16,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  pickerActive: {
    borderColor: '#2E7D32',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  pickerValue: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  chip: {
    margin: 4,
    backgroundColor: '#E8F5E9',
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  flexInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    height: 56,
  },
  addButtonText: {
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  cancelButtonText: {
    fontWeight: '600',
    color: '#666666',
  },
  saveButton: {
    flex: 1,
  },
  saveButtonText: {
    fontWeight: '600',
  },
  editButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
  },
  editButtonText: {
    fontWeight: '600',
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  pickerItemTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
});