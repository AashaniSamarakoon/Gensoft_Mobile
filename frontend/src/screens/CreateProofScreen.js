import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import DatePicker from '../components/DatePicker';
import { useTheme } from '../context/ThemeContext';
import nestjsApiService from '../../services/nestjsApiService';

const { width } = Dimensions.get('window');

const CreateProofScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const { triggerDashboardRefresh } = useDashboard();
  const [formData, setFormData] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date as default
    category: 'Bill',
    amount: '',
    notes: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'Bill', label: 'Bill', icon: 'receipt', requiresAmount: true },
    { id: 'Delivery Photo', label: 'Delivery Photo', icon: 'camera', requiresAmount: false },
    { id: 'Invoice', label: 'Invoice', icon: 'document-text', requiresAmount: true },
    { id: 'Receipt', label: 'Receipt', icon: 'card', requiresAmount: true },
    { id: 'Proof of Delivery', label: 'Proof of Delivery', icon: 'checkmark-circle', requiresAmount: false },
    { id: 'Damage Report', label: 'Damage Report', icon: 'warning', requiresAmount: false },
    { id: 'Other Document', label: 'Other Document', icon: 'document', requiresAmount: false },
  ];

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id === formData.category) || categories[0];
  };

  const selectCategory = (category) => {
    setFormData(prev => ({ ...prev, category: category.id }));
    setShowCategoryModal(false);
  };

  const handleAttachFile = () => {
    if (Platform.OS === 'web') {
      // For web, create a file input
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*,.pdf,.doc,.docx,.txt';
      
      input.onchange = (event) => {
        const files = Array.from(event.target.files);
        files.forEach(file => {
          const newAttachment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: getFileType(file.name),
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uri: URL.createObjectURL(file),
            source: 'web',
            file: file, // Store the actual file object for web
            mimeType: file.type,
          };
          
          console.log('New web attachment created:', newAttachment);
          setAttachments(prev => {
            const updated = [...prev, newAttachment];
            console.log('Updated attachments:', updated);
            return updated;
          });
        });
        
        if (files.length > 0) {
          Alert.alert('Success', `${files.length} file(s) selected successfully!`);
        }
      };
      
      input.click();
    } else {
      // For mobile, show the picker options
      Alert.alert(
        'Attach File',
        'Choose file source',
        [
          {
            text: 'Take Photo',
            onPress: () => handleImageCapture('camera')
          },
          {
            text: 'Choose from Gallery',
            onPress: () => handleImageCapture('gallery')
          },
          {
            text: 'Choose Document',
            onPress: () => handleDocumentPicker()
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'document';
    return 'other';
  };

  const handleImageCapture = async (source) => {
    try {
      console.log(`Image capture starting for source: ${source}`);
      setUploading(true);
      
      // For web, use web file input
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            const newAttachment = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name: file.name,
              type: 'image',
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uri: URL.createObjectURL(file),
              source: source,
              file: file,
              mimeType: file.type,
            };
            
            console.log('New web image attachment created:', newAttachment);
            setAttachments(prev => {
              const updated = [...prev, newAttachment];
              console.log('Updated attachments:', updated);
              return updated;
            });
            Alert.alert('Success', `Image selected successfully!`);
          }
          setUploading(false);
        };
        
        input.click();
      } else {
        // For mobile, use proper ImagePicker
        let result;
        
        if (source === 'camera') {
          // Request camera permissions
          const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
          if (cameraPermission.status !== 'granted') {
            Alert.alert('Permission Required', 'Camera permission is required to take photos.');
            setUploading(false);
            return;
          }
          
          // Launch camera
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            base64: false,
          });
        } else {
          // Request media library permissions
          const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (mediaPermission.status !== 'granted') {
            Alert.alert('Permission Required', 'Photo library permission is required to select images.');
            setUploading(false);
            return;
          }
          
          // Launch image picker
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            base64: false,
          });
        }
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const timestamp = Date.now();
          const fileName = `${source}_${timestamp}.jpg`;
          
          const newAttachment = {
            id: timestamp.toString() + Math.random().toString(36).substr(2, 9),
            name: fileName,
            type: 'image',
            size: asset.fileSize ? `${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB` : '~2.0 MB',
            uri: asset.uri,
            source: source,
            width: asset.width,
            height: asset.height,
            mimeType: 'image/jpeg',
          };
          
          console.log('New mobile image attachment created:', newAttachment);
          setAttachments(prev => {
            const updated = [...prev, newAttachment];
            console.log('Updated attachments:', updated);
            return updated;
          });
          Alert.alert('Success', `${source === 'camera' ? 'Photo captured' : 'Image selected'} successfully!`);
        }
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentPicker = async () => {
    try {
      console.log('Document picker starting');
      setUploading(true);
      
      if (Platform.OS === 'web') {
        // For web, use regular file input with broader file types
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,image/*';
        
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            const newAttachment = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name: file.name,
              type: getFileType(file.name),
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uri: URL.createObjectURL(file),
              source: 'document',
              file: file,
              mimeType: file.type,
            };
            
            console.log('New web document attachment created:', newAttachment);
            setAttachments(prev => {
              const updated = [...prev, newAttachment];
              console.log('Updated attachments:', updated);
              return updated;
            });
            Alert.alert('Success', `Document selected successfully!`);
          }
          setUploading(false);
        };
        
        input.click();
      } else {
        // For mobile, use DocumentPicker
        const result = await DocumentPicker.getDocumentAsync({
          type: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/*'
          ],
          copyToCacheDirectory: true,
          multiple: false,
        });
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          
          const newAttachment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: asset.name,
            type: getFileType(asset.name),
            size: asset.size ? `${(asset.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size',
            uri: asset.uri,
            source: 'document',
            mimeType: asset.mimeType || 'application/octet-stream',
          };
          
          console.log('New mobile document attachment created:', newAttachment);
          setAttachments(prev => {
            const updated = [...prev, newAttachment];
            console.log('Updated attachments:', updated);
            return updated;
          });
          Alert.alert('Success', `Document selected successfully!`);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description');
      return false;
    }

    const selectedCategory = getSelectedCategory();
    if (selectedCategory.requiresAmount && (!formData.amount || parseFloat(formData.amount) <= 0)) {
      Alert.alert('Validation Error', `Amount is required for ${selectedCategory.label} category`);
      return false;
    }

    if (!formData.date) {
      Alert.alert('Validation Error', 'Please select a date');
      return false;
    }

    return true;
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Reset the form and attachments
    setFormData({
      description: '',
      date: getCurrentDate(),
      category: 'Bill',
      amount: '',
      notes: '',
    });
    setAttachments([]);
    // Navigate back to ProofList to refresh the page
    navigation.navigate('ProofList');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Ensure date is in proper ISO format
      const dateObj = new Date(formData.date);
      
      // Prepare attachment filenames/URLs (simplified for now - backend expects string array)
      const attachmentNames = attachments.map((attachment, index) => {
        return attachment.name || attachment.uri || `attachment_${index + 1}`;
      });
      
      // Create JSON payload as expected by backend DTO
      const proofData = {
        description: formData.description.trim(),
        category: formData.category,
        date: dateObj.toISOString(),
        notes: formData.notes.trim(),
        amount: formData.amount ? parseFloat(formData.amount) : null,
        attachments: attachmentNames
      };
      
      console.log('📤 Submitting proof with attachments:', attachments.length);
      console.log('📋 Proof data being sent:', proofData);
      
      const response = await nestjsApiService.createProof(proofData);
      
      // Debug: Log the actual response
      console.log('📋 CreateProof Response:', JSON.stringify(response, null, 2));
      console.log('📋 Response success check:', response?.success);
      console.log('📋 Response type:', typeof response);
      console.log('📋 Response keys:', response ? Object.keys(response) : 'no response');
      
      if (response?.success) {
        console.log('✅ SUCCESS PATH TRIGGERED');
        // Trigger dashboard refresh
        triggerDashboardRefresh();
        setSuccessMessage('Proof submitted successfully for review.');
        setShowSuccessModal(true);
      } else {
        console.log('❌ SUCCESS PATH NOT TRIGGERED');
        console.log('   response?.success:', response?.success);
        console.log('   response.success:', response.success);
      }
    } catch (error) {
      console.error('❌ Error submitting proof:', error);
      console.error('❌ Error response:', error.response?.data);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit proof. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.white }]}>Submit Proof</Text>
            <View style={styles.placeholder} />
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
        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="clipboard-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="e.g., Fuel bill for delivery truck"
              placeholderTextColor="#999"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              maxLength={200}
            />
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowCategoryModal(true)}
          >
            <Ionicons name={selectedCategory.icon} size={20} color="#007bff" />
            <Text style={styles.input}>
              {selectedCategory.label}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Amount Input - Show only if category requires amount */}
        {selectedCategory.requiresAmount && (
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
        )}

        {/* Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date *</Text>
          <DatePicker
            value={formData.date}
            onDateChange={(date) => handleInputChange('date', date)}
            placeholder="Select date"
            maximumDate={new Date()} // Can't select future dates
          />
          <Text style={styles.helperText}>
            Date when the expense occurred or document was created
          </Text>
        </View>

        {/* Attachments Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Attachments</Text>
          
          <TouchableOpacity 
            style={[styles.attachButton, uploading && styles.attachButtonDisabled]} 
            onPress={handleAttachFile}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <ActivityIndicator size="small" color="#007bff" />
                <Text style={styles.attachButtonText}>Processing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="attach" size={20} color="#007bff" />
                <Text style={styles.attachButtonText}>Add Files</Text>
              </>
            )}
          </TouchableOpacity>

          {attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              {attachments.map((attachment) => (
                <View key={attachment.id} style={styles.attachmentItem}>
                  <View style={styles.attachmentInfo}>
                    {attachment.type === 'image' && attachment.uri ? (
                      <Image 
                        source={{ uri: attachment.uri }} 
                        style={styles.attachmentPreview}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons 
                        name={attachment.type === 'image' ? 'image' : 
                              attachment.type === 'pdf' ? 'document-text' : 'document'} 
                        size={20} 
                        color="#666" 
                      />
                    )}
                    <View style={styles.attachmentDetails}>
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text style={styles.attachmentSize}>{attachment.size}</Text>
                      {attachment.source && (
                        <Text style={styles.attachmentSource}>
                          {attachment.source === 'camera' ? '📷 Camera' : 
                           attachment.source === 'gallery' ? '🖼️ Gallery' : 
                           attachment.source === 'document' ? '📄 Document' : '📎 File'}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeAttachment(attachment.id)}
                  >
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Notes Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Additional Notes</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Ionicons name="chatbox-outline" size={20} color="#666" style={styles.textAreaIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any additional details or context..."
              placeholderTextColor="#999"
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButtonContainer, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            style={styles.submitButton}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Proof</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
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
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    formData.category === category.id && styles.selectedCategory
                  ]}
                  onPress={() => selectCategory(category)}
                >
                  <Ionicons name={category.icon} size={24} color="#007bff" />
                  <View style={styles.categoryDetails}>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                    {category.requiresAmount && (
                      <Text style={styles.categoryNote}>Amount required</Text>
                    )}
                  </View>
                  {formData.category === category.id && (
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
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
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007bff',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 10,
  },
  attachButtonDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  attachButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  attachmentsList: {
    marginTop: 10,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  attachmentSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  attachmentSource: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
  attachmentPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    padding: 5,
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
  categoryDetails: {
    flex: 1,
    marginLeft: 15,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  categoryNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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

export default CreateProofScreen;
