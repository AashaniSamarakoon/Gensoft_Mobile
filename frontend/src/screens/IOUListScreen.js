import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AppHeader from '../components/AppHeader';
import nestjsApiService from '../../services/nestjsApiService';

const IOUListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [ious, setIous] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIOU, setSelectedIOU] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'sent', 'received'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    if (user) {
      console.log('💰 IOUListScreen: Loading IOUs for user:', user.username, 'emp_id:', user.id);
      fetchIOUs();
    } else {
      console.log('💰 IOUListScreen: No user - clearing IOUs data');
      // Clear IOUs when no user is authenticated
      setIous([]);
      setIsLoading(false);
    }
  }, [filterType, statusFilter, user]); // Re-fetch when user changes

  const fetchIOUs = useCallback(async () => {
    try {
      console.log('📋 Fetching IOUs with filters:', { filterType, statusFilter });
      console.log('👤 Current user context:', { username: user?.username, empId: user?.id, email: user?.email });
      
      const filters = {
        type: filterType !== 'all' ? filterType : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      
      const response = await nestjsApiService.getIOUs(filters);
      console.log('📋 IOUs Response:', response);
      
      if (response.success) {
        // Handle nested response structure: { data: { data: [...], pagination: {...} } }
        const ious = response.data?.data || response.data || [];
        setIous(ious);
        console.log('✅ IOUs loaded:', ious.length || 0);
      }
    } catch (error) {
      console.error('Error fetching IOUs:', error);
      Alert.alert('Error', 'Failed to fetch IOUs');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [filterType, statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIOUs();
  };

  const handleIOUAction = async (iouId, action) => {
    try {
      let response;
      
      if (action === 'mark-paid') {
        response = await nestjsApiService.markIOUAsPaid(iouId);
      } else {
        // For other actions, we'll need to implement them in the backend
        // For now, let's use the update method
        response = await nestjsApiService.updateIOU(iouId, { status: action });
      }
      
      if (response.success) {
        Alert.alert(
          'Success',
          `IOU ${action === 'mark-paid' ? 'marked as paid' : action} successfully`
        );
        setModalVisible(false);
        fetchIOUs(); // Refresh the list
      }
    } catch (error) {
      console.error(`Error ${action}ing IOU:`, error);
      Alert.alert('Error', `Failed to ${action} IOU. Please try again.`);
    }
  };

  const openIOUDetails = (iou) => {
    setSelectedIOU(iou);
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'paid': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'paid': return 'card';
      default: return 'help-circle';
    }
  };

  const renderIOUCard = (iou) => (
    <TouchableOpacity
      key={iou.id}
      style={styles.iouCard}
      onPress={() => openIOUDetails(iou)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.iouTitle}>{iou.title}</Text>
          <Text style={styles.iouAmount}>${parseFloat(iou.amount).toFixed(2)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(iou.status) }]}>
          <Ionicons name={getStatusIcon(iou.status)} size={16} color="#fff" />
          <Text style={styles.statusText}>{iou.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.iouDescription}>
          {iou.description || 'No description provided'}
        </Text>
        
        <View style={styles.iouDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.detailText}>
              {iou.isCreditor ? `To: ${iou.debtorEmail}` : `From: ${iou.creditorEmail}`}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>
              Due: {new Date(iou.dueDate).toLocaleDateString()}
            </Text>
          </View>
          {iou.isOverdue && (
            <View style={styles.detailRow}>
              <Ionicons name="warning" size={16} color="#ef4444" />
              <Text style={[styles.detailText, { color: '#ef4444' }]}>OVERDUE</Text>
            </View>
          )}
        </View>
      </View>

      {iou.canApprove && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleIOUAction(iou.id, 'approve')}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleIOUAction(iou.id, 'reject')}
          >
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading IOUs...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: theme.colors.white }]}>IOU Management</Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.white }]}>{Array.isArray(ious) ? ious.length : 0} IOUs</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('CreateIOU')}
            >
              <Ionicons name="add" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterTab, filterType === 'all' && styles.activeFilterTab]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterTabText, filterType === 'all' && styles.activeFilterTabText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterType === 'sent' && styles.activeFilterTab]}
            onPress={() => setFilterType('sent')}
          >
            <Text style={[styles.filterTabText, filterType === 'sent' && styles.activeFilterTabText]}>
              Sent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterType === 'received' && styles.activeFilterTab]}
            onPress={() => setFilterType('received')}
          >
            <Text style={[styles.filterTabText, filterType === 'received' && styles.activeFilterTabText]}>
              Received
            </Text>
          </TouchableOpacity>
        </ScrollView>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.statusFilter, statusFilter === status && styles.activeStatusFilter]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.statusFilterText, statusFilter === status && styles.activeStatusFilterText]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* IOU List */}
      <ScrollView
        style={styles.iouList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!Array.isArray(ious) || ious.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No IOUs Found</Text>
            <Text style={styles.emptySubtitle}>
              {filterType === 'all' ? 'Create your first IOU to get started' : 
               filterType === 'sent' ? 'You haven\'t sent any IOUs yet' : 
               'You haven\'t received any IOUs yet'}
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateIOU')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create IOU</Text>
            </TouchableOpacity>
          </View>
        ) : (
          ious.map(iou => renderIOUCard(iou))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateIOU')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* IOU Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>IOU Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedIOU && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Title</Text>
                  <Text style={styles.modalSectionText}>{selectedIOU.title}</Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Amount</Text>
                  <Text style={styles.modalSectionText}>${parseFloat(selectedIOU.amount).toFixed(2)}</Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedIOU.status) }]}>
                    <Ionicons name={getStatusIcon(selectedIOU.status)} size={16} color="#fff" />
                    <Text style={styles.statusText}>{selectedIOU.status.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Description</Text>
                  <Text style={styles.modalSectionText}>{selectedIOU.description || 'No description'}</Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Due Date</Text>
                  <Text style={styles.modalSectionText}>
                    {new Date(selectedIOU.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Created</Text>
                  <Text style={styles.modalSectionText}>
                    {new Date(selectedIOU.createdAt).toLocaleString()}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  headerSafeArea: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.9,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeFilterTab: {
    backgroundColor: '#007bff',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  statusFilter: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeStatusFilter: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  statusFilterText: {
    fontSize: 12,
    color: '#666',
  },
  activeStatusFilterText: {
    color: '#fff',
  },
  iouList: {
    flex: 1,
    padding: 15,
  },
  iouCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 15,
  },
  iouTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  iouAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 12,
  },
  iouDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  iouDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  createButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  modalSectionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default IOUListScreen;
