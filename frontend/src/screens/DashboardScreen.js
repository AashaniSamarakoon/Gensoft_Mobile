import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  Platform,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDashboard } from '../context/DashboardContext';

import NavigationDrawer from '../components/NavigationDrawer';
import BottomNavigation from '../components/BottomNavigation';
import apiService from '../services/apiService';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation, route }) => {
  const { user, company, logout } = useAuth();
  const theme = useTheme();
  const { refreshTrigger } = useDashboard();
  const [searchText, setSearchText] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    // Show welcome message if provided via route params
    if (route?.params?.welcomeMessage) {
      setTimeout(() => {
        Alert.alert('Welcome!', route.params.welcomeMessage);
      }, 500);
    }
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    // Add search functionality here if needed
    console.log('🔍 Searching for:', text);
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout from your account?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('🚪 Dashboard logout initiated...');
              
              // Perform logout
              await logout();
              console.log('✅ Dashboard logout successful');
              
              // Show success message
              Alert.alert(
                'Logout Successful', 
                'You have been successfully logged out.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to welcome screen after user acknowledges
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Welcome' }],
                      });
                    }
                  }
                ]
              );
              
            } catch (error) {
              console.error('❌ Dashboard logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };





  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Custom Header with Dynamic Company Name */}
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {/* Hamburger Menu Button */}
              <TouchableOpacity 
                style={styles.hamburgerButton} 
                onPress={() => setDrawerVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="menu" size={24} color={theme.colors.white} />
              </TouchableOpacity>
              
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>
                  {company?.name || 'Logistics ERP'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.colors.white + 'CC' }]}>
                  Welcome back, {user?.username || 'User'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Search IOUs, Approvals, Documents..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchText}
                onChangeText={handleSearch}
              />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Action Cards */}
        <View style={styles.mainActionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Main Modules</Text>
          
          <View style={styles.mainCardsGrid}>
            {/* IOU Hub Card */}
            <TouchableOpacity
              style={[styles.mainCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('IOUHub')}
              activeOpacity={0.9}
            >
              <View style={styles.mainCardContent}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: '#000' }]}>
                    <Ionicons name="receipt" size={20} color="#fff" />
                  </View>
                  <View style={styles.cardTitleSection}>
                    <Text style={[styles.mainCardTitle, { color: theme.colors.text }]}>IOU</Text>
                    <Text style={[styles.mainCardSubtitle, { color: theme.colors.textSecondary }]}>
                      Expense Management
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
                  Analysis • Create • Settlements • Proofs
                </Text>
              </View>
            </TouchableOpacity>

            {/* Approvals Hub Card */}
            <TouchableOpacity
              style={[styles.mainCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('ApprovalsHub')}
              activeOpacity={0.9}
            >
              <View style={styles.mainCardContent}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: '#000' }]}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </View>
                  <View style={styles.cardTitleSection}>
                    <Text style={[styles.mainCardTitle, { color: theme.colors.text }]}>Approvals</Text>
                    <Text style={[styles.mainCardSubtitle, { color: theme.colors.textSecondary }]}>
                      Review & Approve
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
                  Pending • History • Quick Actions • Status
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={styles.quickAccessSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity 
              style={[styles.quickAccessCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('CreateIOU')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#667eea' }]}>
                <Ionicons name="add" size={16} color="#fff" />
              </View>
              <Text style={[styles.quickAccessText, { color: theme.colors.text }]}>Create IOU</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAccessCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('CreateProof')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#43e97b' }]}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
              <Text style={[styles.quickAccessText, { color: theme.colors.text }]}>Add Proof</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAccessCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('Approvals')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#f093fb' }]}>
                <Ionicons name="time" size={16} color="#fff" />
              </View>
              <Text style={[styles.quickAccessText, { color: theme.colors.text }]}>Approvals</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAccessCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('ReportsList')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#4facfe' }]}>
                <Ionicons name="bar-chart" size={16} color="#fff" />
              </View>
              <Text style={[styles.quickAccessText, { color: theme.colors.text }]}>Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAccessCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('CreateSettlement')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#764ba2' }]}>
                <Ionicons name="card" size={16} color="#fff" />
              </View>
              <Text style={[styles.quickAccessText, { color: theme.colors.text }]}>Settle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAccessCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('Notifications')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#f5576c' }]}>
                <Ionicons name="notifications" size={16} color="#fff" />
              </View>
              <Text style={[styles.quickAccessText, { color: theme.colors.text }]}>Alerts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAccessCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('NestJSTest')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#28a745' }]}>
                <Ionicons name="server" size={16} color="#fff" />
              </View>
              <Text style={[styles.quickAccessText, { color: theme.colors.text }]}>NestJS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAccessCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('ConnectionTest')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#17a2b8' }]}>
                <Ionicons name="wifi" size={16} color="#fff" />
              </View>
              <Text style={[styles.quickAccessText, { color: theme.colors.text }]}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Footer */}
      <BottomNavigation navigation={navigation} activeRoute="Dashboard" />

      {/* Navigation Drawer */}
      <NavigationDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
      />
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
    paddingHorizontal: 8,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '70%',
  },
  hamburgerButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  // Main Action Cards Styles
  mainActionsSection: {
    padding: 16,
    paddingBottom: 8,
  },
  mainCardsGrid: {
    gap: 12,
  },
  mainCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  mainCardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleSection: {
    flex: 1,
  },
  mainCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  mainCardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  // Quick Access Styles
  quickAccessSection: {
    padding: 16,
    paddingTop: 8,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickAccessCard: {
    width: '31%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 70,
    justifyContent: 'center',
  },
  quickIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickAccessText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },
  content: {
    flex: 1,
    paddingBottom: 80, // Space for bottom navigation
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 16,
  },
  companySection: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  companyCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  companyDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsSection: {
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'column',
    gap: 0,
  },
  statCard: {
    width: (width - 60) / 2,
    marginBottom: 2,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  statCardWeb: {
    cursor: 'pointer',
    transform: [{ scale: 1 }],
    transition: 'all 0.2s ease-in-out',
  },
  statCardContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  colorAccent: {
    height: 4,
    width: '100%',
  },
  cardMainContent: {
    padding: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  cardBottomRow: {
    marginTop: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  // New horizontal gradient card styles
  statCardHorizontal: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gradientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
  },
  horizontalCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  horizontalCardCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontalCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
  },
  horizontalCardRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 80,
  },
  horizontalCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8,
  },
  profileImageButton: {
    padding: 2,
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  defaultProfileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  profileInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionsSection: {
    marginBottom: 0,
  },
  actionsGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  // Action card styles (matching StatCard)
  actionCardHorizontal: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionGradientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 16,
  },
  actionCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionCardCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusSection: {
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },

});

export default DashboardScreen;
