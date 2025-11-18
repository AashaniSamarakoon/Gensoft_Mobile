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
import { useTheme } from '../context/ThemeContext';
import apiService from '../services/apiService';

const ProofListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProofs();
  }, []);

  const loadProofs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProofs();
      setProofs(response?.data || []);
    } catch (error) {
      console.error('Error loading proofs:', error);
      Alert.alert('Error', 'Failed to load proofs');
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
      case 'approved': return theme.colors.success;
      case 'rejected': return theme.colors.danger;
      case 'pending': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const ProofCard = ({ proof }) => (
    <TouchableOpacity style={styles.proofCard} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="document-text" size={20} color={theme.colors.primary} />
          <Text style={[styles.proofTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {proof.title || `Proof #${proof.id}`}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(proof.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(proof.status) }]}>
            {proof.status || 'Pending'}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.proofDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {proof.description || 'No description available'}
      </Text>
      
      <View style={styles.cardFooter}>
        <Text style={[styles.proofDate, { color: theme.colors.textMuted }]}>
          {proof.createdAt ? new Date(proof.createdAt).toLocaleDateString() : 'No date'}
        </Text>
        <Text style={[styles.proofAmount, { color: theme.colors.primary }]}>
          {proof.category || 'General'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color={theme.colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Proofs Found</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Create your first proof submission to get started
      </Text>
    </View>
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
              <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
                Proof Management
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.white }]}>
                Manage your proof submissions
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
              onPress={() => navigation.navigate('CreateProof')}
            >
              <Ionicons name="add" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
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
            proofs.map((proof) => (
              <ProofCard key={proof.id} proof={proof} />
            ))
          )}
        </ScrollView>
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  proofCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  proofDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proofDate: {
    fontSize: 12,
  },
  proofAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default ProofListScreen;
