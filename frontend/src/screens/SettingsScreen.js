import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { user, company, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLogout = () => {
    console.log('🔘 Settings logout button clicked!');
    setShowLogoutModal(true);
  };

  const performLogout = async () => {
    try {
      console.log('🚪 Settings logout initiated...');
      setShowLogoutModal(false);
      
      // Perform logout
      await logout();
      console.log('✅ Settings logout successful');
      
      // Show success modal
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('❌ Settings logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    console.log('Navigating to Welcome screen...');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const SettingItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color="#007bff" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#666" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={30} color="#007bff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.companyName}>{company?.name || 'Company'}</Text>
              <Text style={styles.userRole}>{user?.role || 'Employee'}</Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon="person-outline"
            title="Profile"
            subtitle="Edit your personal information"
            onPress={() => {}}
          />
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() => {}}
          />
          <SettingItem
            icon="shield-outline"
            title="Privacy & Security"
            subtitle="Control your privacy settings"
            onPress={() => {}}
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => {}}
          />
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            onPress={() => {}}
          />
          <SettingItem
            icon="download-outline"
            title="Offline Mode"
            subtitle="Download data for offline use"
            onPress={() => {}}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => {}}
          />
          <SettingItem
            icon="document-text-outline"
            title="Terms & Conditions"
            subtitle="Read our terms and conditions"
            onPress={() => {}}
          />
          <SettingItem
            icon="information-circle-outline"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#dc3545" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="log-out-outline" size={48} color="#ff6b6b" />
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to logout from your account?
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutButtonModal]}
                onPress={performLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={48} color="#4caf50" />
              <Text style={styles.modalTitle}>Logout Successful</Text>
              <Text style={styles.modalMessage}>
                You have been successfully logged out.
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSuccessConfirm}
              >
                <Text style={styles.confirmButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
    marginLeft: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonModal: {
    backgroundColor: '#dc3545',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4caf50',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
