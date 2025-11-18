import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Modal,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/apiService';

const SettlementListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState({
    totalRecords: 0,
    totalIouAmount: 0,
    totalUtilized: 0,
    totalBalance: 0
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    payee: '',
    jobNumber: '',
    customer: '',
    module: 'All',
    dateFrom: '',
    dateTo: '',
    refNo: ''
  });

  const statusFilters = ['All', 'PENDING', 'APPROVED', 'PARTIAL', 'FINALIZED', 'REJECTED'];
  const moduleOptions = ['All', 'ACCOUNTS', 'LOGISTICS', 'WAREHOUSE', 'OPERATIONS'];

  useEffect(() => {
    if (user) {
      console.log('🏦 SettlementListScreen: Loading settlements for user:', user.username, 'emp_id:', user.id);
      loadSettlements();
    } else {
      console.log('🏦 SettlementListScreen: No user - clearing settlements data');
      // Clear settlements when no user is authenticated
      setSettlements([]);
      setLoading(false);
    }
  }, [filterStatus, advancedFilters, user]); // Re-fetch when user changes

  const loadSettlements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'All') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      if (advancedFilters.module !== 'All') params.append('module', advancedFilters.module);
      if (advancedFilters.dateFrom) params.append('dateFrom', advancedFilters.dateFrom);
      if (advancedFilters.dateTo) params.append('dateTo', advancedFilters.dateTo);

      const response = await apiService.get(`/api/settlement/list?${params}`);
      
      if (response.success) {
        setSettlements(response.settlements);
        setSummary(response.summary);
      }
    } catch (error) {
      console.error('Error loading settlements:', error);
      Alert.alert('Error', 'Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettlements();
    setRefreshing(false);
  };

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

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one settlement');
      return;
    }

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Settlements`,
      `Are you sure you want to ${action} ${selectedItems.length} selected settlement(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await apiService.post('/api/settlement/bulk-action', {
                settlementIds: selectedItems,
                action: action.toLowerCase()
              });
              
              if (response.success) {
                Alert.alert('Success', response.message);
                setSelectedItems([]);
                loadSettlements();
              }
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} settlements`);
            }
          }
        }
      ]
    );
  };

  const handleStatusUpdate = async (settlementId, newStatus) => {
    try {
      const response = await apiService.put(`/api/settlement/${settlementId}/status`, {
        status: newStatus
      });
      
      if (response.success) {
        Alert.alert('Success', response.message);
        loadSettlements();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update settlement status');
    }
  };

  const applyAdvancedSearch = () => {
    setShowAdvancedSearch(false);
    loadSettlements();
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      payee: '',
      jobNumber: '',
      customer: '',
      module: 'All',
      dateFrom: '',
      dateTo: '',
      refNo: ''
    });
  };

  const filteredSettlements = settlements.filter(settlement => {
    const matchesSearch = !searchQuery || 
      settlement.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      settlement.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      settlement.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      settlement.refNo?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAdvanced = 
      (!advancedFilters.payee || settlement.payee.toLowerCase().includes(advancedFilters.payee.toLowerCase())) &&
      (!advancedFilters.jobNumber || settlement.jobNumber.toLowerCase().includes(advancedFilters.jobNumber.toLowerCase())) &&
      (!advancedFilters.customer || settlement.customer.toLowerCase().includes(advancedFilters.customer.toLowerCase())) &&
      (!advancedFilters.refNo || settlement.refNo?.toLowerCase().includes(advancedFilters.refNo.toLowerCase()));

    return matchesSearch && matchesAdvanced;
  });

  const renderHeader = () => (
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
            <Text style={[styles.headerTitle, { color: theme.colors.white }]}>Settlement Management</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateSettlement')}
          >
            <Ionicons name="add" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={[styles.searchContainer, { backgroundColor: theme.colors.white }]}>
      <View style={styles.searchRow}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.inputBackground }]}>
          <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search settlements..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={loadSettlements}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: theme.colors.primary + '15' }]}
          onPress={() => setShowAdvancedSearch(true)}
        >
          <Ionicons name="filter" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
        {statusFilters.map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilterButton,
              { backgroundColor: filterStatus === status ? theme.colors.primary : theme.colors.inputBackground },
              filterStatus === status && styles.activeFilter
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[
              styles.statusFilterText,
              { color: filterStatus === status ? theme.colors.white : theme.colors.textSecondary },
              filterStatus === status && styles.activeFilterText
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.white }]}>
        <Text style={[styles.summaryNumber, { color: theme.colors.text }]}>{filteredSettlements.length}</Text>
        <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total</Text>
      </View>
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.white }]}>
        <Text style={[styles.summaryNumber, { color: theme.colors.success }]}>
          ${summary.totalIouAmount?.toFixed(0) || 0}
        </Text>
        <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>IOU Amount</Text>
      </View>
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.white }]}>
        <Text style={[styles.summaryNumber, { color: theme.colors.info }]}>
          ${summary.totalUtilized?.toFixed(0) || 0}
        </Text>
        <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Utilized</Text>
      </View>
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.white }]}>
        <Text style={[styles.summaryNumber, { color: theme.colors.error }]}>
          ${summary.totalBalance?.toFixed(0) || 0}
        </Text>
        <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Balance</Text>
      </View>
    </View>
  );

  const renderBulkActions = () => {
    if (selectedItems.length === 0) return null;

    return (
      <View style={styles.bulkActionsContainer}>
        <Text style={styles.bulkActionsText}>{selectedItems.length} selected</Text>
        <View style={styles.bulkActionButtons}>
          <TouchableOpacity 
            style={[styles.bulkActionButton, { backgroundColor: '#10b981' }]}
            onPress={() => handleBulkAction('approve')}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.bulkActionText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bulkActionButton, { backgroundColor: '#ef4444' }]}
            onPress={() => handleBulkAction('reject')}
          >
            <Ionicons name="close" size={16} color="#fff" />
            <Text style={styles.bulkActionText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bulkActionButton, { backgroundColor: '#6b7280' }]}
            onPress={() => handleBulkAction('finalize')}
          >
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.bulkActionText}>Finalize</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSettlementCard = (settlement) => (
    <View key={settlement.id} style={[
      styles.settlementCard,
      { backgroundColor: theme.colors.white },
      selectedItems.includes(settlement.id) && [styles.selectedCard, { borderColor: theme.colors.primary }]
    ]}>
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={() => handleItemSelect(settlement.id)}>
          <Ionicons 
            name={selectedItems.includes(settlement.id) ? "checkbox" : "checkbox-outline"} 
            size={20} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
        <View style={styles.cardHeaderInfo}>
          <Text style={[styles.settlementId, { color: theme.colors.text }]}>#{settlement.id.slice(-8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(settlement.status) }]}>
            <Text style={[styles.statusText, { color: theme.colors.white }]}>{settlement.status}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary + '15' }]}
          onPress={() => navigation.navigate('SettlementDetails', { settlement })}
        >
          <Ionicons name="eye-outline" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardRow}>
          <View style={styles.cardField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>PAYEE</Text>
            <Text style={[styles.fieldValue, { color: theme.colors.text }]}>{settlement.payee}</Text>
            <Text style={[styles.fieldSubValue, { color: theme.colors.primary }]}>{settlement.module}</Text>
          </View>
          <View style={styles.cardField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>JOB NUMBER</Text>
            <Text style={[styles.fieldValue, { color: theme.colors.text }]}>{settlement.jobNumber}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.cardField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>CUSTOMER</Text>
            <Text style={[styles.fieldValue, { color: theme.colors.text }]}>{settlement.customer}</Text>
          </View>
          <View style={styles.cardField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>REF NO</Text>
            <Text style={[styles.fieldValue, { color: theme.colors.text }]}>{settlement.refNo || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.cardField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>IOU AMOUNT</Text>
            <Text style={[styles.amountText, { color: theme.colors.success }]}>${parseFloat(settlement.iouAmount).toFixed(2)}</Text>
          </View>
          <View style={styles.cardField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>UTILIZED</Text>
            <Text style={[styles.utilizedText, { color: theme.colors.info }]}>${parseFloat(settlement.utilized).toFixed(2)}</Text>
          </View>
          <View style={styles.cardField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>BALANCE</Text>
            <Text style={[styles.balanceText, { 
              color: parseFloat(settlement.balance) > 0 ? theme.colors.error : theme.colors.success 
            }]}>${parseFloat(settlement.balance).toFixed(2)}</Text>
          </View>
        </View>

        {settlement.status === 'PENDING' && (
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: theme.colors.success }]}
              onPress={() => handleStatusUpdate(settlement.id, 'APPROVED')}
            >
              <Ionicons name="checkmark" size={14} color={theme.colors.white} />
              <Text style={[styles.quickActionText, { color: theme.colors.white }]}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: theme.colors.error }]}
              onPress={() => handleStatusUpdate(settlement.id, 'REJECTED')}
            >
              <Ionicons name="close" size={14} color={theme.colors.white} />
              <Text style={[styles.quickActionText, { color: theme.colors.white }]}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderAdvancedSearchModal = () => (
    <Modal
      visible={showAdvancedSearch}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAdvancedSearch(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.advancedSearchModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Search</Text>
            <TouchableOpacity onPress={() => setShowAdvancedSearch(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.filterField}>
              <Text style={styles.filterLabel}>Payee</Text>
              <TextInput
                style={styles.filterInput}
                value={advancedFilters.payee}
                onChangeText={(text) => setAdvancedFilters(prev => ({ ...prev, payee: text }))}
                placeholder="Enter payee name"
              />
            </View>

            <View style={styles.filterField}>
              <Text style={styles.filterLabel}>Job Number</Text>
              <TextInput
                style={styles.filterInput}
                value={advancedFilters.jobNumber}
                onChangeText={(text) => setAdvancedFilters(prev => ({ ...prev, jobNumber: text }))}
                placeholder="Enter job number"
              />
            </View>

            <View style={styles.filterField}>
              <Text style={styles.filterLabel}>Customer</Text>
              <TextInput
                style={styles.filterInput}
                value={advancedFilters.customer}
                onChangeText={(text) => setAdvancedFilters(prev => ({ ...prev, customer: text }))}
                placeholder="Enter customer name"
              />
            </View>

            <View style={styles.filterField}>
              <Text style={styles.filterLabel}>Reference No</Text>
              <TextInput
                style={styles.filterInput}
                value={advancedFilters.refNo}
                onChangeText={(text) => setAdvancedFilters(prev => ({ ...prev, refNo: text }))}
                placeholder="Enter reference number"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearAdvancedFilters}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={applyAdvancedSearch}
            >
              <Text style={styles.searchButtonText}>SEARCH</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderSearchAndFilters()}
      {renderSummaryCards()}
      {renderBulkActions()}

      <ScrollView 
        style={styles.settlementsContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading settlements...</Text>
          </View>
        ) : filteredSettlements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Settlements Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Create your first settlement to get started'}
            </Text>
          </View>
        ) : (
          filteredSettlements.map(renderSettlementCard)
        )}
      </ScrollView>

      {renderAdvancedSearchModal()}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  statusFilters: {
    flexDirection: 'row',
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#667eea',
  },
  statusFilterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeFilterText: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  bulkActionsContainer: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bulkActionsText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  bulkActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  bulkActionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  settlementsContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  settlementCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  selectedCard: {
    borderColor: '#667eea',
    backgroundColor: '#f8fafc',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
    marginRight: 12,
  },
  settlementId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  cardContent: {
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 2,
  },
  fieldSubValue: {
    fontSize: 11,
    color: '#6b7280',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  utilizedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  advancedSearchModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    padding: 20,
  },
  filterField: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  searchButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#667eea',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SettlementListScreen;
