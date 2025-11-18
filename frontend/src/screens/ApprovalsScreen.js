import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import nestjsApiService from '../../services/nestjsApiService';

const ApprovalsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  
  // Data states
  const [approvals, setApprovals] = useState([]);
  
  // Form fields for search
  const [invNo, setInvNo] = useState('');
  const [iouNo, setIouNo] = useState('');
  const [jobNo, setJobNo] = useState('');
  const [blNo, setBlNo] = useState('');
  const [customerPayee, setCustomerPayee] = useState('');
  const [refNo, setRefNo] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    loadApprovals();
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [selectedModule, selectedPriority, selectedStatus]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      // For now, show sample data that matches your image
      const sampleApprovals = [
        {
          id: '1',
          title: 'Office Supplies Purchase',
          jobNumber: 'JOB001',
          customerPayee: 'Office Depot',
          refNo: 'REF001',
          amount: 250.00,
          status: 'PENDING',
          priority: 'MEDIUM',
          module: 'Employee'
        },
        {
          id: '2',
          title: 'Sea Import Container Handling',
          jobNumber: 'SI2024001',
          customerPayee: 'ABC Shipping Lines',
          refNo: 'SI-REF-001',
          amount: 1500.00,
          status: 'PENDING',
          priority: 'HIGH',
          module: 'Sea Import'
        },
        {
          id: '3',
          title: 'Client Entertainment Expenses',
          jobNumber: 'ACC2024001',
          customerPayee: 'Restaurant XYZ',
          refNo: 'EXP-001',
          amount: 450.00,
          status: 'APPROVED',
          priority: 'LOW',
          module: 'Accounts'
        }
      ];
      
      setApprovals(sampleApprovals);
    } catch (error) {
      console.error('Error loading approvals:', error);
      Alert.alert('Error', 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApprovals();
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadApprovals();
  };

  const handleApprove = async (approvalId) => {
    try {
      await nestjsApiService.approveApproval(approvalId, { comments: 'Approved via mobile' });
      Alert.alert('Success', 'Approval approved successfully');
      loadApprovals();
    } catch (error) {
      console.error('Error approving:', error);
      Alert.alert('Error', 'Failed to approve');
    }
  };

  const handleReject = async (approvalId) => {
    Alert.alert(
      'Reject Approval',
      'Are you sure you want to reject this approval?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await nestjsApiService.rejectApproval(approvalId, { comments: 'Rejected via mobile' });
              Alert.alert('Success', 'Approval rejected successfully');
              loadApprovals();
            } catch (error) {
              console.error('Error rejecting:', error);
              Alert.alert('Error', 'Failed to reject');
            }
          }
        }
      ]
    );
  };



  const renderApprovalRow = (approval, index) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'PENDING': return '#ff9500';
        case 'APPROVED': return '#34c759';
        case 'REJECTED': return '#ff3b30';
        default: return '#8e8e93';
      }
    };

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'HIGH': return '#ff3b30';
        case 'URGENT': return '#d70015';
        case 'MEDIUM': return '#ff9500';
        case 'LOW': return '#34c759';
        default: return '#8e8e93';
      }
    };

    return (
      <View key={approval.id || index} style={[styles.tableRow, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.tableCell, { color: theme.colors.text }]} numberOfLines={2}>
          {approval.title || 'N/A'}
        </Text>
        <Text style={[styles.tableCell, { color: theme.colors.text }]}>
          {approval.jobNumber || 'N/A'}
        </Text>
        <Text style={[styles.tableCell, { color: theme.colors.text }]} numberOfLines={1}>
          {approval.customerPayee || 'N/A'}
        </Text>
        <Text style={[styles.tableCell, { color: theme.colors.text }]}>
          {approval.refNo || 'N/A'}
        </Text>
        <Text style={[styles.tableCell, { color: theme.colors.text }]}>
          {approval.amount ? `$${approval.amount}` : 'N/A'}
        </Text>
        <View style={styles.tableCell}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(approval.status) }]}>
            <Text style={styles.statusText}>{approval.status}</Text>
          </View>
        </View>
        <View style={styles.tableCell}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(approval.priority) }]}>
            <Text style={styles.priorityText}>{approval.priority}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          {approval.status === 'PENDING' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApprove(approval.id)}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(approval.id)}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approvals</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter Section */}
        <View style={[styles.filterSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.colors.text }]}>MODULE :</Text>
              <TouchableOpacity style={[styles.simpleDropdown, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.dropdownText, { color: theme.colors.text }]}>ALL</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.colors.text }]}>PRIORITY :</Text>
              <TouchableOpacity style={[styles.simpleDropdown, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.dropdownText, { color: theme.colors.text }]}>ALL</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.colors.text }]}>STATUS :</Text>
              <TouchableOpacity style={[styles.simpleDropdown, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.dropdownText, { color: theme.colors.text }]}>PENDING</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>INV NO :</Text>
              <TextInput style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>CUSTOMER/PAYEE :</Text>
              <TextInput style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]} />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>IOU NO :</Text>
              <TextInput style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>REF NO :</Text>
              <TextInput style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]} />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>JOB NO :</Text>
              <TextInput style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>AMOUNT :</Text>
              <TextInput style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]} />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>BL NO :</Text>
              <TextInput style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]} />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>SEARCH</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Table Section */}
        <View style={[styles.tableSection, { backgroundColor: theme.colors.surface }]}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Title</Text>
            <Text style={styles.tableHeaderCell}>Job No</Text>
            <Text style={styles.tableHeaderCell}>Customer/Payee</Text>
            <Text style={styles.tableHeaderCell}>Ref No</Text>
            <Text style={styles.tableHeaderCell}>Amount</Text>
            <Text style={styles.tableHeaderCell}>Status</Text>
            <Text style={styles.tableHeaderCell}>Priority</Text>
            <Text style={styles.tableHeaderCell}>Actions</Text>
          </View>

          {/* Table Body */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                Loading approvals...
              </Text>
            </View>
          ) : approvals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#ccc" />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No approvals found
              </Text>
            </View>
          ) : (
            approvals.map((approval, index) => renderApprovalRow(approval, index))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  filterSection: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    margin: 10,
    borderRadius: 5,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterGroup: {
    flex: 1,
    marginRight: 10,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  simpleDropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 3,
    minHeight: 35,
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputGroup: {
    flex: 1,
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 3,
    minHeight: 35,
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.3,
    alignSelf: 'flex-end',
    marginTop: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  tableSection: {
    margin: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  approveButton: {
    backgroundColor: '#34c759',
  },
  rejectButton: {
    backgroundColor: '#ff3b30',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default ApprovalsScreen;