import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const AccountSwitcher = ({ style }) => {
  const { user, switchToAccount, accounts, addAccount } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [addAccountModal, setAddAccountModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSwitchAccount = async (account) => {
    try {
      setSwitching(true);
      console.log('🔄 Switching to account:', account.username);
      
      const success = await switchToAccount(account);
      if (success) {
        setModalVisible(false);
        console.log('✅ Account switched successfully');
      } else {
        Alert.alert('Error', 'Failed to switch account. Please try again.');
      }
    } catch (error) {
      console.error('❌ Account switch error:', error);
      Alert.alert('Error', 'Failed to switch account: ' + error.message);
    } finally {
      setSwitching(false);
    }
  };

  const handleAddAccount = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_MOBILE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Add account to the list and switch to it
        await addAccount(data);
        setAddAccountModal(false);
        setUsername('');
        setPassword('');
        Alert.alert('Success', 'Account added successfully!');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('❌ Add account error:', error);
      Alert.alert('Error', 'Failed to add account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.switcher, style]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.currentUser}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.substring(0, 2).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username} numberOfLines={1}>
              {user?.username || 'User'}
            </Text>
            <Text style={styles.empId} numberOfLines={1}>
              ID: {user?.id || 'N/A'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>

      {/* Account Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Switch Account</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.accountsList}>
              {accounts.map((account, index) => {
                const accountUser = account.user || account;
                const accountId = accountUser.id || account.id;
                const accountUsername = accountUser.username || accountUser.name || 'Unknown';
                const accountEmail = accountUser.email || 'No email';
                
                return (
                  <TouchableOpacity
                    key={`${accountUsername}-${accountId}-${index}`}
                    style={[
                      styles.accountItem,
                      accountId === user?.id && styles.currentAccountItem
                    ]}
                    onPress={() => handleSwitchAccount(account)}
                    disabled={switching || accountId === user?.id}
                  >
                    <View style={styles.accountInfo}>
                      <View style={styles.accountAvatar}>
                        <Text style={styles.accountAvatarText}>
                          {accountUsername.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.accountDetails}>
                        <Text style={styles.accountUsername}>
                          {accountUsername}
                        </Text>
                        <Text style={styles.accountEmpId}>
                          ID: {accountId} • {accountEmail}
                        </Text>
                      </View>
                    </View>
                    
                    {accountId === user?.id ? (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Add New Account Button */}
              <TouchableOpacity
                style={styles.addAccountButton}
                onPress={() => {
                  setModalVisible(false);
                  setAddAccountModal(true);
                }}
              >
                <Ionicons name="add-circle" size={24} color="#667eea" />
                <Text style={styles.addAccountText}>Add Another Account</Text>
              </TouchableOpacity>
            </ScrollView>

            {switching && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Switching account...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Account Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addAccountModal}
        onRequestClose={() => setAddAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Account</Text>
              <TouchableOpacity
                onPress={() => setAddAccountModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.addAccountForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="white" />
                    <Text style={styles.addButtonText}>Add Account</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 120,
  },
  currentUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: '#667eea',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  empId: {
    fontSize: 11,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  accountsList: {
    maxHeight: 400,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  currentAccountItem: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#667eea',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  accountDetails: {
    flex: 1,
  },
  accountUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accountEmpId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addAccountText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#667eea',
  },
  addAccountForm: {
    padding: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AccountSwitcher;