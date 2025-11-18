import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AccountSwitcher from '../components/AccountSwitcher';
import BottomNavigation from '../components/BottomNavigation';

const ProfileScreen = ({ navigation }) => {
  const { user, company, logout } = useAuth();
  const theme = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });

  const handleLogout = () => {
    console.log('🔘 Profile logout button clicked!');
    setShowLogoutModal(true);
  };

  const performLogout = async () => {
    try {
      console.log('🚪 Profile logout initiated...');
      setShowLogoutModal(false);
      
      // Perform logout
      await logout();
      console.log('✅ Profile logout successful');
      
      // Show success modal
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('❌ Profile logout error:', error);
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

  const ProfileCard = () => (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
          <Ionicons name="person" size={32} color={theme.colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: theme.colors.text }]}>
            {user?.name || user?.username || 'User'}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
            {user?.email || 'No email provided'}
          </Text>
          <Text style={[styles.profileDepartment, { color: theme.colors.primary }]}>
            {user?.department || 'No department'} • {user?.role || 'Employee'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setShowEditModal(true)}
        >
          <Ionicons name="pencil" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: theme.colors.primary + '15' }]}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && !rightComponent && (
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  const SettingSection = ({ title, children }) => (
    <View style={styles.settingSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.colors.white }]}>
        {children}
      </View>
    </View>
  );

  const EditProfileModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.white }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.inputBackground }]}
                value={editData.name}
                onChangeText={(text) => setEditData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.inputBackground }]}
                value={editData.email}
                onChangeText={(text) => setEditData(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Phone</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.inputBackground }]}
                value={editData.phone}
                onChangeText={(text) => setEditData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Department</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.inputBackground }]}
                value={editData.department}
                onChangeText={(text) => setEditData(prev => ({ ...prev, department: text }))}
                placeholder="Enter your department"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                // TODO: Save profile changes
                Alert.alert('Success', 'Profile updated successfully');
                setShowEditModal(false);
              }}
            >
              <Text style={[styles.buttonText, { color: theme.colors.white }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
            <Text style={[styles.headerTitle, { color: theme.colors.white }]}>Profile & Settings</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.contentWrapper}>
        <ScrollView 
          style={styles.scrollContent} 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
        {/* Profile Card */}
        <ProfileCard />

        {/* Company Info */}
        <SettingSection title="COMPANY INFORMATION">
          <SettingItem
            icon="business"
            title={company?.name || 'No Company Selected'}
            subtitle="Current organization"
            showArrow={false}
          />
        </SettingSection>

        {/* Account Settings */}
        <SettingSection title="ACCOUNT SETTINGS">
          {/* Account Switcher Section */}
          <View style={styles.accountSwitcherSection}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="people" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Switch Account</Text>
                <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                  Manage multiple accounts
                </Text>
              </View>
            </View>
            <AccountSwitcher style={styles.accountSwitcher} />
          </View>
          
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive app notifications"
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={notifications ? theme.colors.primary : theme.colors.textMuted}
              />
            }
            showArrow={false}
          />
          
          <SettingItem
            icon="mail"
            title="Email Notifications"
            subtitle="Receive email updates"
            rightComponent={
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={emailNotifications ? theme.colors.primary : theme.colors.textMuted}
              />
            }
            showArrow={false}
          />
          
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Coming soon"
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                disabled={true}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={theme.colors.textMuted}
              />
            }
            showArrow={false}
          />
        </SettingSection>

        {/* App Settings */}
        <SettingSection title="APPLICATION">
          <SettingItem
            icon="shield-checkmark"
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon')}
          />
          
          <SettingItem
            icon="help-circle"
            title="Help & Support"
            subtitle="Get help or contact support"
            onPress={() => Alert.alert('Support', 'For support, please contact your system administrator')}
          />
          
          <SettingItem
            icon="information-circle"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert('About', 'Logistics ERP Mobile\nVersion 1.0.0\n\nBuilt with React Native')}
          />
        </SettingSection>

        {/* Logout Section */}
        <SettingSection title="ACCOUNT">
          <SettingItem
            icon="log-out"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
          />
        </SettingSection>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            Logistics ERP Mobile v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            © 2025 All rights reserved
          </Text>
        </View>
      </ScrollView>

      <EditProfileModal />
      
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
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation navigation={navigation} activeRoute="Profile" />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 100, // Space for bottom navigation
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileDepartment: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  settingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
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
  accountSwitcherSection: {
    backgroundColor: '#fff',
    marginBottom: 2,
    paddingVertical: 8,
  },
  accountSwitcher: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
});

export default ProfileScreen;