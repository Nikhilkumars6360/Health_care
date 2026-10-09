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
    color: '#6A1B9A',
    fontWeight: '500',
    marginTop: 2,
  },
  modeCard: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  modeCardContent: {
    padding: 20,
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modeSubtitle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  controlsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    marginTop: 8,
  },
  controlCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  controlCardContent: {
    padding: 20,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLight: {
    flex: 1,
    alignItems: 'center',
  },
  bigLight: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333333',
    borderWidth: 6,
    borderColor: '#1A1A1A',
    marginBottom: 16,
  },
  bigLightGreen: {
    backgroundColor: '#2E7D32',
    borderColor: '#1B5E20',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
  },
  controlLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#757575',
    marginBottom: 8,
  },
  controlLabelGreen: {
    color: '#2E7D32',
  },
  controlStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  applySection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  applyButton: {
    borderRadius: 12,
  },
  applyButtonText: {
    fontWeight: '600',
  },
  applyWarning: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    color: '#E65100',
    fontWeight: '500',
  },
  autoInfo: {
    paddingHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  autoInfoText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
  },
  infoSection: {
    paddingHorizontal: 16,
    marginTop: 16,
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