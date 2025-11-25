import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Platform,
  RefreshControl,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import BottomNavigation from '../components/BottomNavigation';
import nestjsApiService from '../services/nestjsApiService';
import * as SecureStore from 'expo-secure-store';

const ModuleBasedApprovalsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  
  // Search and form states
  const [iouNo, setIouNo] = useState('');
  const [jobNo, setJobNo] = useState('');
  const [customerPayee, setCustomerPayee] = useState('');
  const [refNo, setRefNo] = useState('');
  const [amount, setAmount] = useState('');
  const [blNo, setBlNo] = useState('');
  const [invNo, setInvNo] = useState('');
  
  // Data states
  const [modules, setModules] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const priorities = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const statuses = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [selectedModule, selectedPriority, selectedStatus]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated before making API calls
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        console.log('⚠️ No authentication token found - skipping API calls');
        setModules([{ id: 'ALL', displayName: 'ALL', name: 'all' }]);
        setApprovals([]);
        return;
      }
      
      await Promise.all([
        loadModules(),
        loadApprovals()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      
      // Set default values on error
      setModules([{ id: 'ALL', displayName: 'ALL', name: 'all' }]);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      // Check authentication first
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        console.log('⚠️ No authentication token - cannot load modules');
        setModules([{ id: 'ALL', displayName: 'ALL', name: 'all' }]);
        return;
      }
      
      const response = await nestjsApiService.getModules();
      const modulesList = response.data || [];
      setModules([{ id: 'ALL', displayName: 'ALL', name: 'all' }, ...modulesList]);
    } catch (error) {
      console.error('Error loading modules:', error);
      
      // Handle specific error types
      if (error.message?.includes('Unauthorized')) {
        console.log('🔐 Authentication required for modules');
      }
      
      setModules([{ id: 'ALL', displayName: 'ALL', name: 'all' }]);
    }
  };

  const loadApprovals = async () => {
    try {
      // Check authentication first
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        console.log('⚠️ No authentication token - cannot load approvals');
        setApprovals([]);
        setTotalCount(0);
        return;
      }
      
      const params = {
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (selectedModule !== 'ALL') {
        params.moduleId = selectedModule;
      }
      if (selectedPriority !== 'ALL') {
        params.priority = selectedPriority;
      }
      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }
      if (customerPayee.trim()) {
        params.customerPayee = customerPayee.trim();
      }
      if (jobNo.trim()) {
        params.jobNumber = jobNo.trim();
      }
      if (refNo.trim()) {
        params.refNo = refNo.trim();
      }

      const response = await nestjsApiService.getApprovals(params);
      const approvalsData = response.data || response || [];
      const total = response.total || approvalsData.length;
      
      setApprovals(Array.isArray(approvalsData) ? approvalsData : []);
      setTotalCount(total);
    } catch (error) {
      console.error('Error loading approvals:', error);
      
      // Handle specific error types
      if (error.message?.includes('Unauthorized')) {
        console.log('🔐 Authentication required - redirecting to login');
        Alert.alert(
          'Authentication Required',
          'Please log in to view approvals.',
          [{ text: 'OK' }]
        );
      }
      
      setApprovals([]);
      setTotalCount(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadApprovals();
  };

  const handleApprovalAction = async (approvalId, action, comments = '') => {
    try {
      await nestjsApiService.post(`/approvals/${approvalId}/${action}`, { comments });
      await loadApprovals(); // Reload data
    } catch (error) {
      console.error(`Error ${action}ing approval:`, error);
    }
  };

  const renderModuleDropdown = () => (
    <TouchableOpacity 
      style={[styles.dropdown, { backgroundColor: theme.colors.surface }]}
      onPress={() => setShowModuleModal(true)}
    >
      <Text style={[styles.dropdownText, { color: theme.colors.text }]}>
        {modules.find(m => m.id === selectedModule)?.displayName || 'ALL'}
      </Text>
      <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderPriorityDropdown = () => (
    <TouchableOpacity 
      style={[styles.dropdown, { backgroundColor: theme.colors.surface }]}
      onPress={() => setShowPriorityModal(true)}
    >
      <Text style={[styles.dropdownText, { color: theme.colors.text }]}>
        {selectedPriority}
      </Text>
      <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderStatusDropdown = () => (
    <TouchableOpacity 
      style={[styles.dropdown, { backgroundColor: theme.colors.surface }]}
      onPress={() => setShowStatusModal(true)}
    >
      <Text style={[styles.dropdownText, { color: theme.colors.text }]}>
        {selectedStatus}
      </Text>
      <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderApprovalRow = ({ item }) => (
    <View style={[styles.tableRow, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.rowContent}>
        <View style={styles.mainInfo}>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.subtitleText, { color: theme.colors.textSecondary }]}>
            {item.module?.displayName || 'No Module'} • {item.itemType?.toUpperCase()}
          </Text>
          {item.jobNumber && (
            <Text style={[styles.subtitleText, { color: theme.colors.textSecondary }]}>
              Job: {item.jobNumber}
            </Text>
          )}
        </View>
        
        <View style={styles.detailsInfo}>
          {item.customerPayee && (
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              Customer: {item.customerPayee}
            </Text>
          )}
          {item.amount && (
            <Text style={[styles.amountText, { color: theme.colors.text }]}>
              ${parseFloat(item.amount).toFixed(2)}
            </Text>
          )}
          {item.refNo && (
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              Ref: {item.refNo}
            </Text>
          )}
        </View>

        <View style={styles.statusActions}>
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: item.status === 'APPROVED' ? '#4CAF50' : 
                             item.status === 'REJECTED' ? '#F44336' : 
                             item.status === 'PENDING' ? '#FF9800' : '#9E9E9E'
            }
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          
          <View style={[
            styles.priorityBadge,
            { 
              backgroundColor: item.priority === 'URGENT' ? '#F44336' : 
                             item.priority === 'HIGH' ? '#FF9800' : 
                             item.priority === 'MEDIUM' ? '#2196F3' : '#4CAF50'
            }
          ]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>

          {item.status === 'PENDING' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => handleApprovalAction(item.id, 'approve')}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => handleApprovalAction(item.id, 'reject')}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderDropdownModal = (visible, onClose, items, selectedValue, onSelect) => (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <FlatList
            data={items}
            keyExtractor={(item) => typeof item === 'string' ? item : item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  (typeof item === 'string' ? item : item.id) === selectedValue && 
                  { backgroundColor: theme.colors.primary + '20' }
                ]}
                onPress={() => {
                  onSelect(typeof item === 'string' ? item : item.id);
                  onClose();
                }}
              >
                <Text style={[styles.modalItemText, { color: theme.colors.text }]}>
                  {typeof item === 'string' ? item : item.displayName}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

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
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Module Approvals</Text>
            <TouchableOpacity style={styles.backButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter Section */}
        <View style={styles.filterSection}>
          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.colors.text }]}>MODULE:</Text>
              {renderModuleDropdown()}
            </View>
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.colors.text }]}>PRIORITY:</Text>
              {renderPriorityDropdown()}
            </View>
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.colors.text }]}>STATUS:</Text>
              {renderStatusDropdown()}
            </View>
          </View>

          {/* Search Fields */}
          <View style={styles.searchSection}>
            <View style={styles.searchRow}>
              <View style={styles.searchGroup}>
                <Text style={[styles.searchLabel, { color: theme.colors.text }]}>IOU NO:</Text>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={iouNo}
                  onChangeText={setIouNo}
                  placeholder="IOU Number"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
              <View style={styles.searchGroup}>
                <Text style={[styles.searchLabel, { color: theme.colors.text }]}>CUSTOMER/PAYEE:</Text>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={customerPayee}
                  onChangeText={setCustomerPayee}
                  placeholder="Customer/Payee"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchGroup}>
                <Text style={[styles.searchLabel, { color: theme.colors.text }]}>JOB NO:</Text>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={jobNo}
                  onChangeText={setJobNo}
                  placeholder="Job Number"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
              <View style={styles.searchGroup}>
                <Text style={[styles.searchLabel, { color: theme.colors.text }]}>REF NO:</Text>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={refNo}
                  onChangeText={setRefNo}
                  placeholder="Reference No"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchGroup}>
                <Text style={[styles.searchLabel, { color: theme.colors.text }]}>BL NO:</Text>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={blNo}
                  onChangeText={setBlNo}
                  placeholder="BL Number"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
              <View style={styles.searchGroup}>
                <Text style={[styles.searchLabel, { color: theme.colors.text }]}>AMOUNT:</Text>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Amount"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>SEARCH</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Section */}
        <View style={styles.resultsSection}>
          <Text style={[styles.resultsCount, { color: theme.colors.text }]}>
            {totalCount} Approval{totalCount !== 1 ? 's' : ''} Found
          </Text>
          
          <FlatList
            data={approvals}
            keyExtractor={(item) => item.id}
            renderItem={renderApprovalRow}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
                <Ionicons name="document-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No approvals found
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* Modals */}
      {renderDropdownModal(
        showModuleModal, 
        () => setShowModuleModal(false), 
        modules, 
        selectedModule, 
        setSelectedModule
      )}
      {renderDropdownModal(
        showPriorityModal, 
        () => setShowPriorityModal(false), 
        priorities, 
        selectedPriority, 
        setSelectedPriority
      )}
      {renderDropdownModal(
        showStatusModal, 
        () => setShowStatusModal(false), 
        statuses, 
        selectedStatus, 
        setSelectedStatus
      )}

      <BottomNavigation navigation={navigation} activeRoute="ApprovalsHub" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  headerSafeArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingBottom: 80,
  },
  filterSection: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 32,
  },
  dropdownText: {
    fontSize: 14,
  },
  searchSection: {
    marginTop: 8,
  },
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  searchLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  searchInput: {
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    minHeight: 32,
  },
  searchButton: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultsSection: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tableRow: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rowContent: {
    gap: 8,
  },
  mainInfo: {
    marginBottom: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailsInfo: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    marginBottom: 2,
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
  },
});

export default ModuleBasedApprovalsScreen;