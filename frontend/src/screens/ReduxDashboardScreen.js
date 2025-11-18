import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useReduxAuth } from '../context/ReduxAuthContext';
import { useIOUs, useProofs, useSettlements, useDashboard } from '../hooks/useERP';

const ReduxDashboardScreen = () => {
  const { user, isAuthenticated } = useReduxAuth();
  const { ious, loading: iousLoading, fetchIOUs } = useIOUs();
  const { proofs, loading: proofsLoading, fetchProofs } = useProofs();
  const { settlements, loading: settlementsLoading, fetchSettlements } = useSettlements();
  const { stats, loading: statsLoading, fetchDashboardStats } = useDashboard();
  
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    console.log('📊 Fetching all dashboard data...');
    await Promise.all([
      fetchIOUs(),
      fetchProofs(),
      fetchSettlements(),
      fetchDashboardStats(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, loading, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>
        {loading ? '...' : value || '0'}
      </Text>
    </TouchableOpacity>
  );

  const showIOUDetails = () => {
    Alert.alert(
      'IOUs Details',
      `Total IOUs: ${ious.length}\nPending: ${ious.filter(i => i.status === 'pending').length}\nApproved: ${ious.filter(i => i.status === 'approved').length}`,
    );
  };

  const showProofDetails = () => {
    Alert.alert(
      'Proofs Details',
      `Total Proofs: ${proofs.length}\nPending: ${proofs.filter(p => p.status === 'pending').length}\nApproved: ${proofs.filter(p => p.status === 'approved').length}`,
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please log in to view the dashboard</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {user?.email || 'User'}!
        </Text>
        <Text style={styles.subtitle}>Here's your ERP overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="IOUs"
          value={ious.length}
          loading={iousLoading}
          onPress={showIOUDetails}
        />
        <StatCard
          title="Proofs"
          value={proofs.length}
          loading={proofsLoading}
          onPress={showProofDetails}
        />
        <StatCard
          title="Settlements"
          value={settlements.length}
          loading={settlementsLoading}
          onPress={() => console.log('Settlement details')}
        />
        <StatCard
          title="Total Amount"
          value={stats?.totalAmount ? `$${stats.totalAmount}` : '$0'}
          loading={statsLoading}
          onPress={() => console.log('Amount details')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent IOUs</Text>
        {iousLoading ? (
          <Text style={styles.loadingText}>Loading IOUs...</Text>
        ) : ious.length > 0 ? (
          ious.slice(0, 5).map((iou, index) => (
            <View key={iou.id || index} style={styles.listItem}>
              <Text style={styles.itemTitle}>
                {iou.description || `IOU #${iou.id}`}
              </Text>
              <Text style={styles.itemAmount}>
                ${iou.amount || '0.00'}
              </Text>
              <Text style={[
                styles.itemStatus,
                { color: iou.status === 'approved' ? '#28a745' : '#ffc107' }
              ]}>
                {iou.status || 'pending'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No IOUs found</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Proofs</Text>
        {proofsLoading ? (
          <Text style={styles.loadingText}>Loading proofs...</Text>
        ) : proofs.length > 0 ? (
          proofs.slice(0, 5).map((proof, index) => (
            <View key={proof.id || index} style={styles.listItem}>
              <Text style={styles.itemTitle}>
                {proof.description || `Proof #${proof.id}`}
              </Text>
              <Text style={styles.itemAmount}>
                ${proof.amount || '0.00'}
              </Text>
              <Text style={[
                styles.itemStatus,
                { color: proof.status === 'approved' ? '#28a745' : '#ffc107' }
              ]}>
                {proof.status || 'pending'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No proofs found</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#007bff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
  },
  section: {
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginRight: 10,
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default ReduxDashboardScreen;