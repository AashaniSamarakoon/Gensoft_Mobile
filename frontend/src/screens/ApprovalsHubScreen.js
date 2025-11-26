import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import BottomNavigation from '../components/BottomNavigation';
import nestjsApiService from '../services/nestjsApiService';
import { useAppNavigation } from '../utils/navigation';

const { width } = Dimensions.get('window');

const ApprovalsHubScreen = () => {
  const navigation = useAppNavigation();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalApprovals: 0,
    pendingIOUs: 0,
    pendingProofs: 0,
  });
  const [recentApprovals, setRecentApprovals] = useState([]);

  useEffect(() => {
    loadApprovalsData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApprovalsData();
    setRefreshing(false);
  };

  const loadApprovalsData = async () => {
    try {
      const [iouResponse, proofResponse] = await Promise.all([
        nestjsApiService.getIOUs ? nestjsApiService.getIOUs().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
        nestjsApiService.getProofs ? nestjsApiService.getProofs().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
      ]);

      const ious = iouResponse.data?.ious || iouResponse.data?.data || [];
      const proofs = proofResponse.data?.data || [];

      // Calculate today's date for filtering
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      // Calculate stats
      const pendingIOUs = ious.filter(iou => iou.status === 'PENDING').length;
      const pendingProofs = proofs.filter(proof => proof.status === 'PENDING').length;
      
      const approvedToday = ious.filter(iou => 
        iou.status === 'APPROVED' && 
        iou.updatedAt?.startsWith(todayString)
      ).length;
      
      const rejectedToday = ious.filter(iou => 
        iou.status === 'REJECTED' && 
        iou.updatedAt?.startsWith(todayString)
      ).length;

      // Combine recent approvals from IOUs and proofs
      const recentIOUs = ious
        .filter(iou => iou.status !== 'PENDING')
        .map(iou => ({ ...iou, type: 'IOU' }));
      
      const recentProofApprovals = proofs
        .filter(proof => proof.status !== 'PENDING')
        .map(proof => ({ ...proof, type: 'PROOF' }));

      const combined = [...recentIOUs, ...recentProofApprovals]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 5);

      setStats({
        pendingApprovals: pendingIOUs + pendingProofs,
        approvedToday,
        rejectedToday,
        totalApprovals: ious.length + proofs.length,
        pendingIOUs,
        pendingProofs,
      });

      setRecentApprovals(combined);
    } catch (error) {
      console.error('Error loading approvals data:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { backgroundColor: theme.colors.surface }]} onPress={onPress}>
      <View style={styles.statCardContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
          <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );



  const RecentApprovalCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.recentCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => {
        if (item.type === 'IOU') {
          navigation.navigate('IOUDetails', { id: item.id });
        } else {
          navigation.navigate('ProofDetails', { id: item.id });
        }
      }}
    >
      <View style={styles.recentCardContent}>
        <View style={[
          styles.typeIndicator,
          { backgroundColor: item.type === 'IOU' ? '#667eea' : '#43e97b' }
        ]}>
          <Ionicons 
            name={item.type === 'IOU' ? 'receipt' : 'document'} 
            size={16} 
            color="#fff" 
          />
        </View>
        <View style={styles.recentInfo}>
          <Text style={[styles.recentTitle, { color: theme.colors.text }]}>
            {item.type} - {item.description || item.title || 'No description'}
          </Text>
          <Text style={[styles.recentSubtitle, { color: theme.colors.textSecondary }]}>
            {item.amount ? `$${item.amount}` : ''} • {item.status}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: item.status === 'APPROVED' ? '#4CAF50' : 
                           item.status === 'REJECTED' ? '#F44336' : '#FF9800' 
          }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Approvals Hub</Text>
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
        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Approval Analytics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon="time"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('PendingApprovals')}
            />
            <StatCard
              title="Approved Today"
              value={stats.approvedToday}
              icon="checkmark-circle"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('ApprovalHistory', { filter: 'approved' })}
            />
            <StatCard
              title="Pending IOUs"
              value={stats.pendingIOUs}
              icon="receipt"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('IOUList', { filter: 'pending' })}
            />
            <StatCard
              title="Pending Proofs"
              value={stats.pendingProofs}
              icon="document"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('ProofList', { filter: 'pending' })}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]} 
              onPress={() => navigation.navigate('IOUList', { filter: 'pending' })}
            >
              <Ionicons name="receipt" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Pending IOUs</Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>Review & approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]} 
              onPress={() => navigation.navigate('ProofList', { filter: 'pending' })}
            >
              <Ionicons name="document" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Pending Proofs</Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>Verify documents</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]} 
              onPress={() => navigation.navigate('ApprovalHistory')}
            >
              <Ionicons name="time" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Approval History</Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>View past decisions</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]} 
              onPress={() => navigation.navigate('ModuleBasedApprovals')}
            >
              <Ionicons name="layers" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Module Approvals</Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>Filter by modules</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Approvals */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ApprovalHistory')}>
              <Text style={[styles.viewAllButton, { color: theme.colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentApprovals.length > 0 ? (
            recentApprovals.map((item, index) => (
              <RecentApprovalCard key={index} item={item} />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="document-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No recent approvals
              </Text>
            </View>
          )}
        </View>

        {/* Reports Section */}
        <View style={styles.reportsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Reports & Analytics</Text>
          <View style={styles.reportCards}>
            <TouchableOpacity 
              style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('ApprovalAnalytics')}
            >
              <Ionicons name="analytics" size={24} color={theme.colors.primary} />
              <Text style={[styles.reportTitle, { color: theme.colors.text }]}>Analytics</Text>
              <Text style={[styles.reportSubtitle, { color: theme.colors.textSecondary }]}>Approval trends</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('ApprovalExports')}
            >
              <Ionicons name="download" size={24} color={theme.colors.primary} />
              <Text style={[styles.reportTitle, { color: theme.colors.text }]}>Export</Text>
              <Text style={[styles.reportSubtitle, { color: theme.colors.textSecondary }]}>Download data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  // Statistics Styles
  statsSection: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Actions Styles
  actionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  // Recent Approvals Styles
  recentSection: {
    padding: 20,
    paddingTop: 0,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentSubtitle: {
    fontSize: 12,
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
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  // Reports Styles
  reportsSection: {
    padding: 20,
    paddingTop: 0,
  },
  reportCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  reportCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  reportSubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ApprovalsHubScreen;