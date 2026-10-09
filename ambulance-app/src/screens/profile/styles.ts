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
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    backgroundColor: '#FFF3E0',
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
  vehicle: {
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
  input: {
    marginBottom: 16,
  },
  accountInfo: {
    marginTop: 8,
  },
  accountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  buttonSection: {
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    borderRadius: 12,
  },
  cancelButtonText: {
    fontWeight: '600',
    color: '#666666',
  },
  saveButton: {
    borderRadius: 12,
  },
  saveButtonText: {
    fontWeight: '600',
  },
  editButton: {
    borderRadius: 12,
    marginBottom: 8,
  },
  editButtonText: {
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 12,
  },
  logoutButtonText: {
    fontWeight: '600',
    color: '#C62828',
  },
});