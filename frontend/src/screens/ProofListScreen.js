import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import nestjsApiService from '../../services/nestjsApiService';

const ProofListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('📋 ProofListScreen: Loading proofs for user:', user.username, 'emp_id:', user.id);
      loadProofs();
    } else {
      console.log('📋 ProofListScreen: No user - clearing proofs data');
      // Clear proofs when no user is authenticated
      setProofs([]);
      setLoading(false);
    }
  }, [user]); // Re-fetch when user changes

  const loadProofs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading proofs...');
      const response = await nestjsApiService.getProofs();
      console.log('📋 Proofs response:', response);
      
      // Handle nested response structure
      const proofsData = response?.data?.data || response?.data?.proofs || response?.data || [];
      console.log('📋 Setting proofs data:', proofsData);
      setProofs(Array.isArray(proofsData) ? proofsData : []);
    } catch (error) {
      console.error('❌ Error loading proofs:', error);
      Alert.alert('Error', 'Failed to load proofs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProofs();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const ProofCard = ({ proof }) => (
    <TouchableOpacity style={styles.proofCard} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="document-text" size={20} color="#667eea" />
          <Text style={styles.proofTitle} numberOfLines={1}>
            {proof.description || `Proof #${proof.id}`}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(proof.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(proof.status) }]}>
            {proof.status || 'Pending'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.proofDescription} numberOfLines={2}>
        {proof.notes || 'No notes available'}
      </Text>
      
      <View style={styles.cardFooter}>
        <Text style={styles.proofDate}>
          {proof.date ? new Date(proof.date).toLocaleDateString() : 'No date'}
        </Text>
        <Text style={styles.proofAmount}>
          {proof.category || 'General'} {proof.amount ? `- $${proof.amount}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No Proofs Found</Text>
      <Text style={styles.emptySubtitle}>
        Create your first proof submission to get started
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateProof')}
      >
        <Ionicons name="add" size={20} color="#ffffff" />
        <Text style={styles.createButtonText}>Create Proof</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                Proof Management
              </Text>
              <Text style={styles.headerSubtitle}>
                Manage your proof submissions
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('CreateProof')}
            >
              <Ionicons name="add" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>
            Loading proofs...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {proofs.length === 0 ? (
            <EmptyState />
          ) : (
            <View style={styles.proofsContainer}>
              <Text style={styles.sectionTitle}>Your Proofs ({proofs.length})</Text>
              {proofs.map((proof) => (
                <ProofCard key={proof.id} proof={proof} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginTop: 4,
    color: '#ffffff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  proofsContainer: {
    gap: 12,
  },
  proofCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  proofDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proofDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  proofAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProofListScreen;