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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import BottomNavigation from '../components/BottomNavigation';
import nestjsApiService from '../../services/nestjsApiService';

const { width } = Dimensions.get('window');

const IOUHubScreen = ({ navigation }) => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalIOUs: 0,
    pendingIOUs: 0,
    approvedIOUs: 0,
    totalAmount: 0,
    pendingProofs: 0,
    settlements: 0,
  });

  useEffect(() => {
    loadIOUStats();
  }, []);

  const loadIOUStats = async () => {
    try {
      const [iouResponse, proofResponse, settlementResponse] = await Promise.all([
        nestjsApiService.getIOUs().catch(() => ({ data: { data: [] } })),
        nestjsApiService.getProofs().catch(() => ({ data: { data: [] } })),
        nestjsApiService.getSettlements().catch(() => ({ data: { data: [] } })),
      ]);

      console.log('📋 IOUs Response:', JSON.stringify(iouResponse));
      console.log('📄 Proofs Response:', JSON.stringify(proofResponse));
      console.log('🏦 Settlements Response:', JSON.stringify(settlementResponse));

      // Parse IOUs - backend returns { data: { data: [...], pagination: {...} }, success: true }
      const ious = iouResponse.data?.data || iouResponse.data || [];

      // Parse Proofs and Settlements
      const proofs = proofResponse.data?.data || proofResponse.data || [];
      const settlements = settlementResponse.data?.data || settlementResponse.data || [];

      // Ensure arrays are valid before processing
      const safeIOUs = Array.isArray(ious) ? ious : [];
      const safeProofs = Array.isArray(proofs) ? proofs : [];
      const safeSettlements = Array.isArray(settlements) ? settlements : [];

      console.log('✅ IOUs loaded:', safeIOUs.length);
      console.log('✅ Proofs loaded:', safeProofs.length);
      console.log('✅ Settlements loaded:', safeSettlements.length);

      const totalAmount = safeIOUs.reduce((sum, iou) => sum + (parseFloat(iou.amount) || 0), 0);
      const pendingIOUs = safeIOUs.filter(iou => iou.status === 'PENDING').length;
      const approvedIOUs = safeIOUs.filter(iou => iou.status === 'APPROVED').length;
      const pendingProofs = safeProofs.filter(proof => proof.status === 'PENDING').length;

      setStats({
        totalIOUs: safeIOUs.length,
        pendingIOUs,
        approvedIOUs,
        totalAmount,
        pendingProofs,
        settlements: safeSettlements.length,
      });
    } catch (error) {
      console.error('Error loading IOU stats:', error);
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
            <Text style={styles.headerTitle}>IOU Hub</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>IOU Analytics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total IOUs"
              value={stats.totalIOUs}
              icon="receipt"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('IOUList')}
            />
            <StatCard
              title="Pending IOUs"
              value={stats.pendingIOUs}
              icon="time"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('IOUList', { filter: 'pending' })}
            />
            <StatCard
              title="Total Amount"
              value={`$${stats.totalAmount.toFixed(2)}`}
              icon="cash"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('IOUAnalytics')}
            />
            <StatCard
              title="Pending Proofs"
              value={stats.pendingProofs}
              icon="document"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('ProofList')}
            />
          </View>
        </View>

        {/* IOU Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>IOU Management</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]} 
              onPress={() => navigation.navigate('CreateIOU')}
            >
              <Ionicons name="add" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Create IOU</Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>New expense request</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]} 
              onPress={() => navigation.navigate('IOUList')}
            >
              <Ionicons name="list" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>View All IOUs</Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>Browse & manage</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]} 
              onPress={() => navigation.navigate('CreateSettlement')}
            >
              <Ionicons name="card" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Settlements</Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>Process payments</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]} 
              onPress={() => navigation.navigate('CreateProof')}
            >
              <Ionicons name="camera" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Add Proof</Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>Upload documents</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reports Section */}
        <View style={styles.reportsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Reports & Analytics</Text>
          <View style={styles.reportCards}>
            <TouchableOpacity 
              style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('IOUAnalytics')}
            >
              <Ionicons name="bar-chart" size={24} color={theme.colors.primary} />
              <Text style={[styles.reportTitle, { color: theme.colors.text }]}>Analytics</Text>
              <Text style={[styles.reportSubtitle, { color: theme.colors.textSecondary }]}>View detailed reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('IOUExports')}
            >
              <Ionicons name="download" size={24} color={theme.colors.primary} />
              <Text style={[styles.reportTitle, { color: theme.colors.text }]}>Export</Text>
              <Text style={[styles.reportSubtitle, { color: theme.colors.textSecondary }]}>Download reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeRoute="IOUHub" />
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

export default IOUHubScreen;