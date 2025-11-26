import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../context/AuthContext';
import { useAppNavigation } from '../utils/navigation';

const SavedAccountsScreen = () => {
  const { accounts, switchToAccount, clearAccounts, debugAccounts, reloadAccounts, quickLogin, isAuthenticated } = useAuth();
  const navigation = useAppNavigation();
  const [loading, setLoading] = useState(false);
  const [switchingAccountId, setSwitchingAccountId] = useState(null);
  const [hasAttemptedQuickLogin, setHasAttemptedQuickLogin] = useState(false);
  
  // Debug: Log accounts when component renders
  useEffect(() => {
    console.log('👥 SavedAccountsScreen - Available accounts:', accounts?.length || 0);
    if (accounts?.length > 0) {
      accounts.forEach((acc, index) => {
        const user = acc.user || acc;
        console.log(`${index + 1}. ${user.username} (${user.email})`);
      });
    }
  }, [accounts]);

  // Load accounts on component mount only (if not already loaded)
  useEffect(() => {
    if (!accounts || accounts.length === 0) {
      console.log('📱 SavedAccountsScreen mounted - loading accounts');
      reloadAccounts();
    }
  }, []); // Empty dependency array to run only once

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated && !hasAttemptedQuickLogin) {
      console.log('🔄 User already authenticated, no need for SavedAccountsScreen');
      // Don't trigger any login here - user is already authenticated
      return;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    console.log('📋 SavedAccountsScreen - Loaded accounts:', accounts);
    console.log('📋 SavedAccountsScreen - Account count:', accounts?.length || 0);
    if (accounts && accounts.length > 0) {
      accounts.forEach((account, index) => {
        console.log(`📋 Account ${index}:`, {
          username: account.user?.username || account.username,
          id: account.user?.id || account.id,
          email: account.user?.email || account.email,
          structure: Object.keys(account)
        });
      });
    }
  }, [accounts]);

  const handleAccountSelect = async (account) => {
    try {
      // Prevent multiple attempts
      if (loading || hasAttemptedQuickLogin || isAuthenticated) {
        console.log('🔒 Quick login already in progress or completed');
        return;
      }
      
      setSwitchingAccountId(account.user?.id || account.id);
      setLoading(true);
      setHasAttemptedQuickLogin(true);
      console.log('🔄 Account selected for smart login:', account.user?.username || account.username);
      
      // Try quick login first
      const quickLoginResult = await quickLogin(account);
      
      if (quickLoginResult.success) {
        // Quick login successful, AuthContext will handle navigation automatically
        console.log('⚡ Quick login successful, AuthContext will navigate to Dashboard');
        // No manual navigation needed - AuthContext setIsAuthenticated(true) will switch stacks
      } else if (quickLoginResult.needsPassword) {
        // Password required, navigate to login screen with pre-filled info
        console.log('🔒 Password required:', quickLoginResult.reason);
        const accountUser = account.user || account;
        navigation.navigate('Login', {
          selectedAccount: account,
          preFilledUsername: accountUser.username || accountUser.name,
          accountEmail: accountUser.email,
          accountId: accountUser.id,
          securityReason: quickLoginResult.reason
        });
      } else {
        // Unknown error, show alert and navigate to login
        Alert.alert('Security Check', quickLoginResult.reason || 'Please enter your password to continue');
        const accountUser = account.user || account;
        navigation.navigate('Login', {
          selectedAccount: account,
          preFilledUsername: accountUser.username || accountUser.name,
          accountEmail: accountUser.email,
          accountId: accountUser.id,
          securityReason: quickLoginResult.reason
        });
      }
    } catch (error) {
      console.error('❌ Account selection error:', error);
      
      // Different error handling based on error type
      let errorMessage = 'Please enter your password to continue.';
      let securityReason = 'Password required for security verification';
      
      if (error.message.includes('Network') || error.message.includes('connection')) {
        errorMessage = 'Unable to connect to server. Please check your connection and try logging in manually.';
        securityReason = 'Network connection required for quick login';
      } else if (error.message.includes('expired') || error.message.includes('invalid')) {
        errorMessage = 'Your session has expired. Please enter your password to continue.';
        securityReason = 'Session expired - password verification required';
      } else if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
        errorMessage = 'Please enter your password to verify your identity.';
        securityReason = 'Identity verification required';
      }
      
      Alert.alert(
        'Quick Login Unavailable', 
        errorMessage,
        [
          {
            text: 'Enter Password',
            onPress: () => {
              const accountUser = account.user || account;
              navigation.navigate('Login', {
                selectedAccount: account,
                preFilledUsername: accountUser.username || accountUser.name,
                accountEmail: accountUser.email,
                accountId: accountUser.id,
                securityReason: securityReason
              });
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
      setSwitchingAccountId(null);
    }
  };

  const handleAddNewAccount = () => {
    // Navigate to QR scanning since that's how new accounts are registered
    navigation.navigate('QRScanner');
  };

  const handleShowAccountDetails = () => {
    if (!accounts || accounts.length === 0) {
      Alert.alert('No Accounts', 'No saved accounts found.');
      return;
    }

    let details = 'Saved Accounts Details:\\n\\n';
    accounts.forEach((account, index) => {
      const user = account.user || account;
      details += `${index + 1}. Username: ${user.username || 'Unknown'}\\n`;
      details += `   Email: ${user.email || 'No email'}\\n`;
      details += `   ID: ${user.id || 'Unknown'}\\n`;
      details += `   Last Login: ${account.lastLogin ? new Date(account.lastLogin).toLocaleDateString() : 'Never'}\\n\\n`;
    });

    details += 'Tip: Keep only the account that works with QR scanning. Remove others using the red trash icon on each card.';

    Alert.alert('Account Details', details, [{ text: 'OK' }]);
  };

  const handleClearAllAccounts = () => {
    Alert.alert(
      'Clear All Accounts',
      'Are you sure you want to remove all saved accounts? You will need to login again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearAccounts();
            Alert.alert('Cleared', 'All accounts have been cleared.');
          },
        },
      ]
    );
  };

  const AccountCard = ({ account }) => {
    const user = account.user || account;
    const isLoading = switchingAccountId === (user.id || account.id);


    
    return (
      <Animatable.View 
        animation="fadeInUp" 
        duration={600}
        style={styles.accountCard}
      >
        <View style={styles.accountCardContainer}>
          <TouchableOpacity
            style={[styles.accountButton, isLoading && styles.accountButtonLoading]}
            onPress={() => handleAccountSelect(account)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <View style={styles.accountInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(user.username || user.name || 'U').substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>
                  {user.username || user.name || 'Unknown User'}
                </Text>
                <Text style={styles.accountRole}>
                  {user.username && user.username.toLowerCase().includes('demo') ? 'Demo Account' : 'Employee Account'}
                </Text>
              </View>
          </View>
          
          <View style={styles.accountAction}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#667eea" />
                <Text style={styles.loadingText}>
                  {switchingAccountId === user.id ? 'Signing in...' : 'Loading...'}
                </Text>
              </View>
            ) : (
              <View style={styles.loginHint}>
                <Ionicons name="flash" size={16} color="#28a745" />
                <Text style={styles.quickLoginText}>
                  {user.username && user.username.toLowerCase().includes('demo') ? 'Demo Account ✓' : 'Quick Access'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#667eea" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Delete Button */}
        </View>
      </Animatable.View>
    );
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animatable.View 
          animation="fadeInDown" 
          duration={800}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={40} color="#ffffff" />
            </View>
            <Text style={styles.title}>Select Account</Text>
            <Text style={styles.subtitle}>Choose an existing account or add new one</Text>
          </View>
        </Animatable.View>

        {/* Content */}
        <View style={styles.content}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {accounts && accounts.length > 0 ? (
              <>
                <Animatable.View 
                  animation="fadeInUp" 
                  duration={600}
                  delay={200}
                >
                  <Text style={styles.sectionTitle}>Saved Accounts ({accounts.length})</Text>
                </Animatable.View>

                {accounts.map((account, index) => (
                  <AccountCard 
                    key={`account-${account.user?.id || account.id || index}`}
                    account={account} 
                  />
                ))}


              </>
            ) : (
              <Animatable.View 
                animation="fadeInUp" 
                duration={600}
                delay={200}
                style={styles.emptyContainer}
              >
                <Ionicons name="people-outline" size={80} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyTitle}>No Saved Accounts</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't saved any accounts yet. Add your first account to get started.
                </Text>
              </Animatable.View>
            )}
          </ScrollView>

          {/* Add New Account Button */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            delay={600}
            style={styles.bottomContainer}
          >
            <TouchableOpacity
              style={styles.addAccountButton}
              onPress={handleAddNewAccount}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.addAccountGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="qr-code-outline" size={24} color="#ffffff" />
                <Text style={styles.addAccountText}>Register New Account</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  accountCard: {
    marginBottom: 15,
  },
  accountButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginBottom: 12,
  },
  accountButtonLoading: {
    opacity: 0.7,
  },
  accountInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  accountRole: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    marginTop: 2,
  },
  accountAction: {
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  bottomContainer: {
    padding: 20,
  },
  addAccountButton: {
    borderRadius: 15,
    marginHorizontal: 20,
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  addAccountGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  addAccountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  loadingText: {
    fontSize: 12,
    color: '#667eea',
    marginTop: 4,
    textAlign: 'center',
  },
  loginHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  quickLoginText: {
    fontSize: 12,
    color: '#28a745',
    marginHorizontal: 4,
    fontWeight: '500',
  },

});

export default SavedAccountsScreen;