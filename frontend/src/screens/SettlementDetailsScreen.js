import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/apiService';

const SettlementDetailsScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const [settlement, setSettlement] = useState(route.params?.settlement || null);
  const [editedSettlement, setEditedSettlement] = useState(route.params?.settlement || {});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (route.params?.settlement) {
      setSettlement(route.params.settlement);
      setEditedSettlement(route.params.settlement);
    }
  }, [route.params]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'PARTIAL': return '#3b82f6';
      case 'FINALIZED': return '#6b7280';
      case 'REJECTED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleStatusChange = async (newStatus) => {
    Alert.alert(
      `${newStatus} Settlement`,
      `Are you sure you want to ${newStatus.toLowerCase()} this settlement?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await apiService.put(`/api/settlement/${settlement.id}/status`, {
                status: newStatus
              });
              
              if (response.success) {
                const updatedSettlement = { ...settlement, status: newStatus };
                setSettlement(updatedSettlement);
                setEditedSettlement(updatedSettlement);
                Alert.alert('Success', response.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to update settlement status');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.put(`/api/settlement/${settlement.id}`, editedSettlement);
      
      if (response.success) {
        setSettlement(response.settlement);
        setEditedSettlement(response.settlement);
        setIsEditing(false);
        Alert.alert('Success', 'Settlement updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update settlement');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.header}
    >
      <View style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settlement Details</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons name={isEditing ? "close" : "create"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderInfoCard = (title, content) => (
    <View style={styles.infoCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      {content}
    </View>
  );

  const renderInfoRow = (label, value, editable = false, field = '') => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editable && isEditing ? (
        <TextInput
          style={styles.editInput}
          value={String(value)}
          onChangeText={(text) => 
            setEditedSettlement(prev => ({ ...prev, [field]: text }))
          }
        />
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );

  const renderStatusSection = () => (
    <View style={styles.statusSection}>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(settlement?.status) }]}>
        <Text style={styles.statusText}>{settlement?.status}</Text>
      </View>
      
      {!isEditing && settlement?.status === 'PENDING' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => handleStatusChange('APPROVED')}
          >
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleStatusChange('REJECTED')}
          >
            <Ionicons name="close-circle" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, styles.finalizeBtn]}
            onPress={() => handleStatusChange('FINALIZED')}
          >
            <Ionicons name="checkmark-done-circle" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Finalize</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderFinancialSummary = () => {
    const iouAmount = parseFloat(editedSettlement.iouAmount) || 0;
    const utilized = parseFloat(editedSettlement.utilized) || 0;
    const returnAmount = parseFloat(editedSettlement.returnAmount) || 0;
    const tax = parseFloat(editedSettlement.tax) || 0;
    const vat = parseFloat(editedSettlement.vat) || 0;
    const balance = parseFloat(editedSettlement.balance) || 0;
    const total = parseFloat(editedSettlement.total) || 0;

    return (
      <View style={styles.financialSummary}>
        <Text style={styles.summaryTitle}>Financial Breakdown</Text>
        
        <View style={styles.financialGrid}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>IOU Amount</Text>
            <Text style={[styles.financialValue, { color: '#667eea' }]}>
              ${iouAmount.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Utilized</Text>
            <Text style={[styles.financialValue, { color: '#3b82f6' }]}>
              ${utilized.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Return Amount</Text>
            <Text style={[styles.financialValue, { color: '#6b7280' }]}>
              ${returnAmount.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Balance</Text>
            <Text style={[
              styles.financialValue, 
              { color: balance >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              ${balance.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Tax</Text>
            <Text style={[styles.financialValue, { color: '#f59e0b' }]}>
              ${tax.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>VAT</Text>
            <Text style={[styles.financialValue, { color: '#f59e0b' }]}>
              ${vat.toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  if (!settlement) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Settlement not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderStatusSection()}

        {/* Settlement ID and Reference */}
        {renderInfoCard('Settlement Information', (
          <>
            <View style={styles.settlementHeader}>
              <Text style={styles.settlementId}>#{settlement.id?.slice(-8) || 'N/A'}</Text>
              <Text style={styles.settlementDate}>
                {new Date(settlement.createdAt || Date.now()).toLocaleDateString()}
              </Text>
            </View>
            {renderInfoRow('Reference No', editedSettlement.refNo || 'N/A', isEditing, 'refNo')}
          </>
        ))}

        {/* Basic Information */}
        {renderInfoCard('Basic Information', (
          <>
            {renderInfoRow('Payee', editedSettlement.payee, isEditing, 'payee')}
            {renderInfoRow('Module', editedSettlement.module, isEditing, 'module')}
            {renderInfoRow('Job Number', editedSettlement.jobNumber, isEditing, 'jobNumber')}
            {renderInfoRow('Customer', editedSettlement.customer, isEditing, 'customer')}
            {renderInfoRow('Cost Center', editedSettlement.costCenter || 'N/A', isEditing, 'costCenter')}
          </>
        ))}

        {/* Financial Information */}
        {renderFinancialSummary()}

        {/* Description */}
        {renderInfoCard('Description', (
          <View style={styles.descriptionContainer}>
            {isEditing ? (
              <TextInput
                style={styles.descriptionInput}
                value={editedSettlement.description}
                onChangeText={(text) => 
                  setEditedSettlement(prev => ({ ...prev, description: text }))
                }
                placeholder="Enter description"
                multiline={true}
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.descriptionText}>
                {editedSettlement.description || 'No description provided'}
              </Text>
            )}
          </View>
        ))}

        {/* Activity Timeline */}
        {renderInfoCard('Activity Timeline', (
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Settlement Created</Text>
                <Text style={styles.timelineDate}>
                  {new Date(settlement.createdAt || Date.now()).toLocaleString()}
                </Text>
              </View>
            </View>
            
            {settlement.updatedAt && settlement.updatedAt !== settlement.createdAt && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Last Updated</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(settlement.updatedAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: getStatusColor(settlement.status) }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Current Status: {settlement.status}</Text>
                <Text style={styles.timelineDate}>
                  {settlement.status === 'PENDING' ? 'Awaiting approval' : 
                   settlement.status === 'APPROVED' ? 'Approved for processing' :
                   settlement.status === 'FINALIZED' ? 'Settlement completed' :
                   settlement.status === 'REJECTED' ? 'Settlement rejected' : 'Status updated'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerSafeArea: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  statusSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  approveBtn: {
    backgroundColor: '#10b981',
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
  },
  finalizeBtn: {
    backgroundColor: '#6b7280',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settlementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settlementId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  settlementDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    color: '#1f2937',
    textAlign: 'right',
  },
  financialSummary: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  financialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  financialItem: {
    width: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  financialLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  financialValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  descriptionContainer: {
    minHeight: 60,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  timelineContainer: {
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#667eea',
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SettlementDetailsScreen;