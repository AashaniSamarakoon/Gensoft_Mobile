import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { getBaseURL } from '../config/apiConfig.js';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LocalStorageService from '../services/LocalStorageService';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import nestjsApiService from '../../services/nestjsApiService';
import { useAppNavigation } from '../utils/navigation';

const QRScannerScreen = ({ route }) => {
  const navigation = useAppNavigation();
  const { loginWithQR, user } = useAuth();
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showAlreadyRegisteredModal, setShowAlreadyRegisteredModal] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState(null);
  
  // Get the method from route params (live or image)
  const scanMethod = route?.params?.method || 'live';

  useEffect(() => {
    if (scanMethod === 'live') {
      requestCameraPermission();
    } else {
      // For image method, show image picker immediately
      showImagePickerOptions();
    }
  }, [scanMethod]);

  const requestCameraPermission = async () => {
    try {
      const permissionResponse = await requestPermission();
      
      if (permissionResponse?.status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to scan QR codes.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => requestCameraPermission() },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Camera permission error:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);
    
    await handleQRData(data);
  };

  const resetScanner = () => {
    setScanned(false);
    setLoading(false);
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to scan QR codes from images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processImageForQR(result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Gallery picker error:', error);
      Alert.alert('Error', 'Failed to access photo library');
    }
  };

  const takePhotoForQR = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access to take photos of QR codes.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processImageForQR(result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Camera picker error:', error);
      Alert.alert('Error', 'Failed to access camera');
    }
  };

  const processImageForQR = async (imageUri) => {
    setLoading(true);
    
    try {
      console.log('📷 Processing image for QR code:', imageUri);
      
      // Resize and compress image for better processing
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1000 } }, // Resize to reasonable size
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      console.log('Image processed, sending to server for QR detection...');

      // Send the image to server for QR code detection - CENTRALIZED CONFIG
      const response = await fetch(`${getBaseURL()}/auth/scan-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: manipulatedImage.base64,
          imageUri: manipulatedImage.uri
        })
      });

      const result = await response.json();

      if (response.ok && result.success && result.qrData) {
        console.log('✅ QR Code detected from image:', result.qrData);
        await handleQRData(result.qrData);
      } else if (result.success && !result.qrData) {
        Alert.alert(
          'No QR Code Found', 
          'No QR code was detected in the selected image. Please try with a clearer image containing a visible QR code.',
          [
            { text: 'Try Again', onPress: showImagePickerOptions },
            { text: 'Cancel', onPress: () => navigation.goBack() }
          ]
        );
        setLoading(false);
      } else {
        Alert.alert(
          'Processing Error',
          result.error || 'Failed to process the image. Please try again.',
          [
            { text: 'Try Again', onPress: showImagePickerOptions },
            { text: 'Cancel', onPress: () => navigation.goBack() }
          ]
        );
        setLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Image QR processing error:', error);
      Alert.alert(
        'Network Error',
        'Failed to process QR code from image. Please check your connection and try again.',
        [
          { text: 'Try Again', onPress: showImagePickerOptions },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
      setLoading(false);
    }
  };

  const handleLogoutAndReregister = async (userInfo) => {
    try {
      setLoading(true);
      
      // Call logout endpoint to clear user session/password - CENTRALIZED CONFIG
      const authToken = await LocalStorageService.getItem('@auth_token');
      const logoutResponse = await fetch(`${getBaseURL()}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          email: userInfo.email,
          employeeId: userInfo.employeeId
        })
      });

      const logoutResult = await logoutResponse.json();

      if (logoutResponse.ok && logoutResult.success) {
        console.log('✅ User logged out and reset for re-registration');
        
        Alert.alert(
          'Account Reset Successful',
          'The existing account has been logged out. You can now scan the QR code again to register.',
          [
            {
              text: 'Scan QR Again',
              onPress: () => {
                setShowAlreadyRegisteredModal(false);
                setScanned(false);
                setLoading(false);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Logout Error',
          logoutResult.error || 'Failed to logout existing account. Please try again.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      console.error('❌ Logout and reset error:', error);
      Alert.alert(
        'Network Error',
        'Failed to reset account. Please check your connection and try again.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQRData = async (qrData) => {
    try {
      console.log('📱 Processing QR Code data:', qrData);
      
      // Use the dedicated NestJS API service
      const result = await nestjsApiService.scanQRCode(qrData);
      console.log('🔍 Backend QR scan result:', result);

      if (result.success) {
        if (result.skipVerification) {
          // User already verified, go directly to password setup
          console.log('⏩ User already verified - skipping to password setup');
          navigation.navigate('SetPassword', {
            email: result.data.email,
            username: result.data.username,
            userId: result.data.userId,
            employeeId: result.data.employeeId,
            isNewUser: result.data.isNewUser,
            skipVerification: true
          });
        } else {
          // Normal flow: go to verification screen
          console.log('📧 Verification email sent to:', result.data.email);
          navigation.navigate('Verification', {
            email: result.data.email,
            username: result.data.username || result.data.name,
            userId: result.data.userId || null,
            employeeId: result.data.employeeId || null,
            isNewUser: result.data.isNewUser || true
          });
        }
      } else if (!result.success && result.alreadyRegistered) {
        // User already registered - show appropriate message and redirect
        console.log('🚫 User already registered:', result.message);
        
        Alert.alert(
          'Account Already Registered',
          `This QR code belongs to an existing account (${result.data?.username || result.username || 'user'}). Would you like to log in with your credentials?`,
          [
            {
              text: 'Go to Login',
              onPress: () => {
                navigation.navigate('Login', {
                  preFilledUsername: result.data?.username || result.username,
                  accountEmail: result.data?.email || result.email,
                  securityReason: 'Account already exists - please enter your password'
                });
              }
            },
            {
              text: 'Scan Different QR',
              onPress: () => {
                setScanned(false);
                setLoading(false);
              }
            }
          ]
        );
      } else {
        // Handle specific errors from backend
        let errorTitle = 'QR Scan Error';
        let errorMessage = result.error || result.message || 'Failed to process QR code';
        
        // Check for specific error messages that indicate user already exists
        if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
          errorTitle = 'Account Already Exists';
          errorMessage = 'This QR code belongs to an existing account. Please use the login option to access your account.';
          
          Alert.alert(
            errorTitle,
            errorMessage,
            [
              {
                text: 'Go to Login',
                onPress: () => {
                  navigation.navigate('Login', {
                    securityReason: 'Account already exists - please enter your credentials'
                  });
                }
              },
              {
                text: 'Scan Different QR',
                onPress: () => {
                  setScanned(false);
                  setLoading(false);
                }
              }
            ]
          );
          return;
        }
        
        Alert.alert(
          errorTitle, 
          errorMessage,
          [{ text: 'Try Again', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      console.error('❌ QR scan processing error:', error);
      
      // Check if error message indicates user already exists
      if (error.message && (error.message.includes('already exists') || error.message.includes('already registered'))) {
        Alert.alert(
          'Account Already Exists',
          'This QR code belongs to an existing account. Please use the login option to access your account.',
          [
            {
              text: 'Go to Login',
              onPress: () => {
                navigation.navigate('Login', {
                  securityReason: 'Account already exists - please enter your credentials'
                });
              }
            },
            {
              text: 'Try Again',
              onPress: () => {
                setScanned(false);
                setLoading(false);
              }
            }
          ]
        );
        return;
      }
      
      // Provide specific error message based on error type
      let errorMessage = 'Please check your internet connection and try again.';
      if (error.message.includes('Server connection failed') || error.message.includes('Network connection failed')) {
        errorMessage = 'Cannot connect to server. Please ensure the server is running and try again.';
      }
      
      Alert.alert(
        'Network Error',
        errorMessage,
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select QR Code Image',
      'Choose how you want to provide the QR code image',
      [
        { text: 'Camera', onPress: takePhotoForQR },
        { text: 'Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // If image method is selected, show loading screen
  if (scanMethod === 'image') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>
          {loading ? 'Processing QR code...' : 'Select an image...'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Camera access denied</Text>
        <Text style={styles.errorSubtext}>
          Please enable camera access in your device settings to scan QR codes.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestCameraPermission}>
          <Text style={styles.retryButtonText}>Retry Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.gradientStart} />
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={styles.container}
      >
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <Text style={styles.headerSubtitle}>
            Position the QR code within the frame to login
          </Text>
        </View>
      </View>

      {/* Camera Container */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        <View style={styles.cameraOverlay}>
          {/* Scanning Frame */}
          <View style={styles.scanFrame}>
            <View style={styles.scanCorner} />
            <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
            
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Processing QR code...</Text>
              </View>
            )}
            
            {showMessage && (
              <View style={styles.messageOverlay}>
                <Text style={styles.messageText}>{messageText}</Text>
              </View>
            )}
          </View>

          </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActionsContainer}>
        {scanned && !loading && (
          <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
            <Text style={styles.scanAgainButtonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
        
        {/* Image Picker Button */}
        <TouchableOpacity style={styles.imagePickerButton} onPress={showImagePickerOptions}>
          <Ionicons name="image-outline" size={20} color="#495057" />
          <Text style={styles.imagePickerButtonText}>Upload QR Image</Text>
        </TouchableOpacity>
        
        <Text style={styles.instructionText}>
          Make sure the QR code is well-lit and clearly visible{'\n'}
          Or tap "Upload QR Image" to scan from photo
        </Text>
      </View>

      {/* Already Registered Modal */}
      <Modal
        visible={showAlreadyRegisteredModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAlreadyRegisteredModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning-outline" size={48} color="#FFB74D" />
              <Text style={styles.modalTitle}>Already Registered</Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Employee <Text style={styles.boldText}>{registeredUserData?.username}</Text> is already registered!
              </Text>
              <Text style={styles.modalText}>
                Email: <Text style={styles.boldText}>{registeredUserData?.email}</Text>
              </Text>
              <Text style={styles.modalText}>
                This account already has a password set and is ready to use.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.primaryButton]}
                onPress={() => {
                  setShowAlreadyRegisteredModal(false);
                  navigation.navigate('Login', {
                    preFilledEmail: registeredUserData?.email,
                    fromExistingAccount: true
                  });
                }}
              >
                <Text style={styles.primaryButtonText}>Go to Login</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => {
                  setShowAlreadyRegisteredModal(false);
                  handleLogoutAndReregister(registeredUserData);
                }}
              >
                <Ionicons name="refresh-outline" size={20} color="#007bff" />
                <Text style={styles.secondaryButtonText}>Reset & Re-register</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAlreadyRegisteredModal(false);
                  setScanned(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    marginRight: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007bff',
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  scanCornerTopRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  scanCornerBottomLeft: {
    bottom: 0,
    left: 0,
    top: 'auto',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  scanCornerBottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(248,249,250,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingText: {
    color: '#495057',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  messageOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,69,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  bottomActions: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  scanAgainButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scanAgainButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    color: '#e0e0e0',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePickerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  imagePickerButtonText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  bottomActionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 25,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  instructionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    maxWidth: 400,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 12,
  },
  modalBody: {
    padding: 25,
  },
  modalText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  modalButtons: {
    padding: 20,
    paddingTop: 0,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(0,123,255,0.1)',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  secondaryButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRScannerScreen;
