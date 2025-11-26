import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../utils/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/apiService';

const CreateSettlementScreen = () => {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [showModulePicker, setShowModulePicker] = useState(false);
  const [showCostCenterPicker, setShowCostCenterPicker] = useState(false);

  const [formData, setFormData] = useState({
    payee: '',
    module: '',
    jobNumber: '',
    customer: '',
    refNo: '',
    iouAmount: '',
    returnAmount: '0',
    utilized: '',
    tax: '0',
    vat: '0',
    description: '',
    costCenter: ''
  });

  // Mock data - in production, these would come from API
  const jobNumbers = [
    'JOB5TLN00532',
    'JOB5TLN00533',
    'JOB5TLN00534',
    'JOB5TLN00535',
    'JOB5TLN00536',
    'JOB5TLN00537',
    'JOB5TLN00538',
    'JOB5TLN00539',
    'JOB5TLN00540',
  ];

  const modules = [
    'ACCOUNTS',
    'LOGISTICS',
    'WAREHOUSE',
    'OPERATIONS',
    'TRANSPORT',
    'CUSTOMS'
  ];

  const costCenters = [
    'OPERATIONS',
    'LOGISTICS',
    'WAREHOUSE',
    'TRANSPORT',
    'CUSTOMS',
    'GENERAL',
    'ADMIN'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate totals when financial fields change
    if (['iouAmount', 'utilized', 'returnAmount', 'tax', 'vat'].includes(field)) {
      calculateTotals({ ...formData, [field]: value });
    }
  };

  const calculateTotals = (data) => {
    const iouAmount = parseFloat(data.iouAmount) || 0;
    const utilized = parseFloat(data.utilized) || 0;
    const returnAmount = parseFloat(data.returnAmount) || 0;
    const tax = parseFloat(data.tax) || 0;
    const vat = parseFloat(data.vat) || 0;

    // Calculate balance and total
    const balance = iouAmount - utilized - returnAmount;
    const total = utilized + tax + vat;

    setFormData(prev => ({
      ...prev,
      balance: balance.toFixed(2),
      total: total.toFixed(2)
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.payee.trim()) errors.push('Payee name is required');
    if (!formData.module) errors.push('Module is required');
    if (!formData.jobNumber) errors.push('Job number is required');
    if (!formData.customer.trim()) errors.push('Customer is required');
    if (!formData.iouAmount || parseFloat(formData.iouAmount) <= 0) {
      errors.push('Valid IOU amount is required');
    }
    if (!formData.utilized || parseFloat(formData.utilized) < 0) {
      errors.push('Valid utilized amount is required');
    }
    if (!formData.description.trim()) errors.push('Description is required');

    // Business validation
    const iouAmount = parseFloat(formData.iouAmount) || 0;
    const utilized = parseFloat(formData.utilized) || 0;
    const returnAmount = parseFloat(formData.returnAmount) || 0;

    if (utilized + returnAmount > iouAmount) {
      errors.push('Utilized + Return amount cannot exceed IOU amount');
    }

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        iouAmount: parseFloat(formData.iouAmount),
        returnAmount: parseFloat(formData.returnAmount) || 0,
        utilized: parseFloat(formData.utilized),
        tax: parseFloat(formData.tax) || 0,
        vat: parseFloat(formData.vat) || 0,
        costCenter: formData.costCenter || 'GENERAL'
      };

      const response = await apiService.post('/api/settlement/create', submitData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Settlement created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Settlement creation error:', error);
      Alert.alert('Error', 'Failed to create settlement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
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
          <Text style={[styles.headerTitle, { color: theme.colors.white }]}>Create Settlement</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderFormField = (label, field, placeholder, options = {}) => {
    const {
      multiline = false,
      keyboardType = 'default',
      required = false,
      editable = true
    } = options;

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <Text style={styles.colon}>:</Text>
        <TextInput
          style={[
            styles.textInput,
            multiline && styles.textArea,
            !editable && styles.disabledInput
          ]}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          keyboardType={keyboardType}
          editable={editable && !isLoading}
        />
      </View>
    );
  };

  const renderPickerField = (label, field, options, showPicker, setShowPicker, required = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <Text style={styles.colon}>:</Text>
      <TouchableOpacity 
        style={[styles.pickerButton, !formData[field] && styles.emptyPicker]}
        onPress={() => setShowPicker(true)}
        disabled={isLoading}
      >
        <Text style={[styles.pickerText, !formData[field] && styles.placeholderText]}>
          {formData[field] || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>
      
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    formData[field] === option && styles.selectedOption
                  ]}
                  onPress={() => {
                    handleInputChange(field, option);
                    setShowPicker(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    formData[field] === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {formData[field] === option && (
                    <Ionicons name="checkmark" size={20} color="#667eea" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderFinancialSummary = () => {
    const iouAmount = parseFloat(formData.iouAmount) || 0;
    const utilized = parseFloat(formData.utilized) || 0;
    const returnAmount = parseFloat(formData.returnAmount) || 0;
    const tax = parseFloat(formData.tax) || 0;
    const vat = parseFloat(formData.vat) || 0;
    const balance = iouAmount - utilized - returnAmount;
    const total = utilized + tax + vat;

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Financial Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>IOU Amount:</Text>
          <Text style={styles.summaryValue}>${iouAmount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Utilized:</Text>
          <Text style={styles.summaryValue}>${utilized.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Return Amount:</Text>
          <Text style={styles.summaryValue}>${returnAmount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Balance:</Text>
          <Text style={[
            styles.summaryValue,
            styles.balanceText,
            { color: balance >= 0 ? '#10b981' : '#ef4444' }
          ]}>
            ${balance.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax:</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>VAT:</Text>
          <Text style={styles.summaryValue}>${vat.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, styles.totalLabel]}>Total Amount:</Text>
          <Text style={[styles.summaryValue, styles.totalValue]}>${total.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            {renderFormField('Payee Name', 'payee', 'Enter payee name', { required: true })}
            
            {renderPickerField('Module', 'module', modules, showModulePicker, setShowModulePicker, true)}
            
            {renderPickerField('Job Number', 'jobNumber', jobNumbers, showJobPicker, setShowJobPicker, true)}
            
            {renderFormField('Customer', 'customer', 'Enter customer name', { required: true })}
            
            {renderFormField('Reference No', 'refNo', 'Enter reference number (optional)')}
          </View>

          {/* Financial Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Information</Text>
            
            {renderFormField('IOU Amount', 'iouAmount', '0.00', { 
              keyboardType: 'numeric', 
              required: true 
            })}
            
            {renderFormField('Utilized Amount', 'utilized', '0.00', { 
              keyboardType: 'numeric', 
              required: true 
            })}
            
            {renderFormField('Return Amount', 'returnAmount', '0.00', { 
              keyboardType: 'numeric' 
            })}
            
            {renderFormField('Tax Amount', 'tax', '0.00', { 
              keyboardType: 'numeric' 
            })}
            
            {renderFormField('VAT Amount', 'vat', '0.00', { 
              keyboardType: 'numeric' 
            })}
          </View>

          {/* Additional Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            
            {renderPickerField('Cost Center', 'costCenter', costCenters, showCostCenterPicker, setShowCostCenterPicker)}
            
            {renderFormField('Description', 'description', 'Enter description', { 
              multiline: true, 
              required: true 
            })}
          </View>

          {/* Financial Summary */}
          {(formData.iouAmount || formData.utilized) && renderFinancialSummary()}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.submitButtonText}>Creating...</Text>
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.submitButtonText}>Create Settlement</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    width: 100,
    paddingTop: 12,
  },
  required: {
    color: '#ef4444',
  },
  colon: {
    fontSize: 14,
    color: '#6b7280',
    paddingTop: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    minHeight: 42,
  },
  emptyPicker: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  pickerText: {
    fontSize: 14,
    color: '#374151',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '70%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#f8fafc',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#667eea',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  balanceText: {
    fontWeight: 'bold',
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#667eea',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  submitButton: {
    backgroundColor: '#667eea',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonIcon: {
    marginRight: 4,
  },
});

export default CreateSettlementScreen;
