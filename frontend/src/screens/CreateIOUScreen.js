import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDashboard } from '../context/DashboardContext';
import DatePicker from '../components/DatePicker';
import nestjsApiService from '../../services/nestjsApiService';

const { width } = Dimensions.get('window');

const CreateIOUScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const { triggerDashboardRefresh } = useDashboard();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    debtorEmail: '',
    dueDate: '',
    category: 'general'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    { label: 'General', value: 'general', icon: 'document-text', color: theme.colors.textSecondary },
    { label: 'Business', value: 'business', icon: 'briefcase', color: theme.colors.primary },
    { label: 'Personal', value: 'personal', icon: 'person', color: theme.colors.success },
    { label: 'Emergency', value: 'emergency', icon: 'warning', color: theme.colors.danger },
    { label: 'Equipment', value: 'equipment', icon: 'build', color: theme.colors.warning },
    { label: 'Transportation', value: 'transportation', icon: 'car', color: theme.colors.info }
  ];

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Reset the form when user closes the success message
    setFormData({
      title: '',
      description: '',
      amount: '',
      debtorEmail: '',
      dueDate: '',
      category: 'general'
    });
    console.log('✅ Form reset after successful IOU creation');
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter IOU title');
      return false;
    }
    if (!formData.amount.trim() || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return false;
    }
    if (!formData.debtorEmail.trim()) {
      Alert.alert('Error', 'Please enter debtor email');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.debtorEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    // Check if debtor email is same as current user
    if (formData.debtorEmail.toLowerCase().trim() === user?.email?.toLowerCase()) {
      Alert.alert('Error', 'You cannot create an IOU for yourself');
      return false;
    }
    
    if (!formData.dueDate.trim()) {
      Alert.alert('Error', 'Please select a due date');
      return false;
    }
    
    // Check if due date is in the future
    const selectedDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      Alert.alert('Error', 'Due date must be in the future');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit function called!');
    console.log('📋 Current form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Validation failed, stopping submission');
      return;
    }
    
    console.log('✅ Validation passed, proceeding with submission');

    setIsLoading(true);
    try {
      const iouData = {
        ...formData,
        amount: parseFloat(formData.amount).toFixed(2),
        debtorEmail: formData.debtorEmail.toLowerCase().trim(),
        title: formData.title.trim(),
        description: formData.description.trim()
      };

      console.log('📝 Creating IOU:', iouData);
      const response = await nestjsApiService.createIOU(iouData);
      console.log('✅ IOU Creation Response:', response);
      
      // Check success more robustly - the API is returning success, so show the alert
      if (response?.success === true) {
        console.log('🎉 SUCCESS CONDITION MET - Showing success alert!');
        // Trigger dashboard refresh
        triggerDashboardRefresh();
        setSuccessMessage(`IOU created successfully!\n\nTitle: ${iouData.title}\nAmount: $${iouData.amount}\nDebtor: ${iouData.debtorEmail}\n\nThe IOU has been saved and the debtor will be notified.`);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error creating IOU:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create IOU. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectCategory = (category) => {
    setFormData(prev => ({ ...prev, category: category.value }));
    setShowCategoryModal(false);
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.value === formData.category) || categories[0];
  };

  const formatCurrency = (value) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts[1];
    }
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    return numericValue;
  };

  const selectedCategory = getSelectedCategory();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerContent}>
            <Ionicons name="receipt" size={32} color={theme.colors.white} />
            <Text style={[styles.headerTitle, { color: theme.colors.white }]}>Create New IOU</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.white }]}>
              Add details for the new IOU request
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.contentWrapper}>
        <KeyboardAvoidingView 
          style={styles.formWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.formContainer} 
            contentContainerStyle={styles.formContentContainer}
            showsVerticalScrollIndicator={false}
          >
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>IOU Title *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="e.g., Office supplies purchase"
              placeholderTextColor="#999"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              maxLength={100}
            />
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount ($) *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#999"
              value={formData.amount}
              onChangeText={(value) => handleInputChange('amount', formatCurrency(value))}
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Debtor Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Debtor Email *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="debtor@example.com"
              placeholderTextColor="#999"
              value={formData.debtorEmail}
              onChangeText={(value) => handleInputChange('debtorEmail', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Due Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Due Date *</Text>
          <DatePicker
            value={formData.dueDate}
            onDateChange={(date) => handleInputChange('dueDate', date)}
            placeholder="Select due date"
            minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Tomorrow
          />
          <Text style={styles.helperText}>
            Due date must be in the future
          </Text>
        </View>

        {/* Category Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowCategoryModal(true)}
          >
            <Ionicons name={selectedCategory.icon} size={20} color={selectedCategory.color} />
            <Text style={styles.input}>
              {selectedCategory.label}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Ionicons name="clipboard-outline" size={20} color="#666" style={styles.textAreaIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detailed description of the IOU purpose..."
              placeholderTextColor="#999"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButtonContainer, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            style={styles.submitButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Create IOU</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Category Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryItem,
                    formData.category === category.value && styles.selectedCategory
                  ]}
                  onPress={() => selectCategory(category)}
                >
                  <Ionicons name={category.icon} size={24} color={category.color} />
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                  {formData.category === category.value && (
                    <Ionicons name="checkmark" size={20} color="#007bff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccessModalClose}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginTop: 5,
  },
  contentWrapper: {
    flex: 1,
  },
  formWrapper: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  formContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 15,
    minHeight: 120,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    padding: 0,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginLeft: 5,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginLeft: 35,
  },
  submitButtonContainer: {
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#f8f9ff',
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: width * 0.9,
    minWidth: 300,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  successButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CreateIOUScreen;
