import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const AccountSelectionScreen = ({ navigation }) => {
  const { accounts, selectAccount, clearAccounts } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  // Debug accounts structure
  console.log('🏢 AccountSelectionScreen - accounts:', accounts);
  console.log('🏢 AccountSelectionScreen - accounts length:', accounts.length);

  const handleAccountSelect = async (accountId) => {
    if (loading) return;
    
    setLoading(true);
    setSelectedAccountId(accountId);

    try {
      console.log('👤 Selecting account:', accountId);
      
      const result = await selectAccount(accountId);
      
      if (result.success) {
        console.log('✅ Account selected successfully');
        // Navigation will be handled automatically by AuthContext
      } else if (result.needsPassword && result.navigateToLogin) {
        console.log('🔐 Password required, navigating to login screen');
        // Navigate to login screen with account context
        navigation.navigate('Login', {
          account: result.account,
          reason: result.reason,
          fromAccountSelection: true
        });
      } else {
        Alert.alert('Login Failed', result.error || 'Failed to select account');
      }
    } catch (error) {
      console.error('❌ Account selection error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setSelectedAccountId(null);
    }
  };

  const handleBackToScanner = () => {
    clearAccounts();
    navigation.goBack();
  };

  const renderAccountItem = ({ item }) => {
    // Handle different account structures (direct account or nested user object)
    const account = item.user || item;
    const accountId = account.id || item.id;
    const accountName = account.name || account.username || 'Unknown';
    const company = item.company || account.company || 'No Company';
    const role = account.role || 'Employee';
    const department = account.department;
    
    return (
      <TouchableOpacity
        style={[
          styles.accountCard,
          selectedAccountId === accountId && styles.accountCardSelected,
        ]}
        onPress={() => handleAccountSelect(accountId)}
        disabled={loading}
      >
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{accountName}</Text>
          <Text style={styles.companyName}>{company}</Text>
          <Text style={styles.accountRole}>{role}</Text>
          {department && (
            <Text style={styles.accountDepartment}>Department: {department}</Text>
          )}
        </View>
        
        {loading && selectedAccountId === accountId ? (
          <ActivityIndicator size="small" color="#007bff" />
        ) : (
          <View style={styles.selectIndicator}>
            <Text style={styles.selectText}>Select</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Accounts Found</Text>
      <Text style={styles.emptyStateText}>
        The QR code you scanned doesn't have any associated accounts.
      </Text>
      <TouchableOpacity style={styles.backButton} onPress={handleBackToScanner}>
        <Text style={styles.backButtonText}>Scan Different QR Code</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Account</Text>
        <Text style={styles.headerSubtitle}>
          Choose the account you want to access
        </Text>
      </View>

      {/* Account List */}
      {accounts.length > 0 ? (
        <>
          <FlatList
            data={accounts}
            renderItem={renderAccountItem}
            keyExtractor={(item, index) => item?.id?.toString() || item?.user?.id?.toString() || index.toString()}
            style={styles.accountList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.backToScannerButton}
              onPress={handleBackToScanner}
              disabled={loading}
            >
              <Text style={styles.backToScannerButtonText}>
                Scan Different QR Code
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        renderEmptyState()
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Logging in...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 25,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    textAlign: 'center',
  },
  accountList: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  accountCardSelected: {
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  companyName: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
    marginBottom: 3,
  },
  accountRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  accountDepartment: {
    fontSize: 12,
    color: '#999',
  },
  selectIndicator: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomActions: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  backToScannerButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backToScannerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default AccountSelectionScreen;
