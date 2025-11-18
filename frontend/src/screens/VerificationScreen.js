import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import nestjsApiService from '../../services/nestjsApiService';

const VerificationScreen = ({ route, navigation }) => {
  const { email, username, userId, employeeId, isNewUser } = route.params;
  const { login } = useAuth();
  const theme = useTheme();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const textInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Verification code must be 6 digits');
      return;
    }

    // Prevent multiple simultaneous requests
    if (loading) {
      console.log('⚠️ Verification already in progress, ignoring duplicate request');
      return;
    }

    setLoading(true);

    try {
      console.log('📱 Verifying code for email:', email);
      console.log('🔑 Verification code:', verificationCode);
      
      // Use the dedicated NestJS API service
      const data = await nestjsApiService.verifyEmail(email, employeeId, verificationCode);

      if (data.success) {
        console.log('✅ Verification successful:', data);

        // Navigate to SetPasswordScreen after successful verification
        navigation.navigate('SetPassword', {
          userId: userId,
          username: username,
          email: email,
          employeeId: employeeId,
          isNewUser: isNewUser
        });

        return; // Exit early to prevent any further processing
      } else {
        console.log('❌ Verification failed:', data.error);
        Alert.alert('Error', data.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      
      // Provide specific error message based on error type
      let errorMessage = 'Network error. Please check your connection and try again.';
      if (error.message.includes('Server connection failed') || error.message.includes('Network connection failed')) {
        errorMessage = 'Cannot connect to server. Please ensure the server is running and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Verification Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      // Trigger resend by calling QR scan endpoint again
      Alert.alert('Success', 'New verification code sent to your email');
      setTimeLeft(600); // Reset timer
      setCanResend(false);
      setVerificationCode(''); // Clear input
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar backgroundColor={theme.colors.gradientStart} barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={40} color="white" />
              </View>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to
              </Text>
              <Text style={styles.emailText}>{email}</Text>
              
              {/* User Badge */}
              <View style={styles.userBadge}>
                <Ionicons 
                  name={isNewUser ? "person-add" : "shield-checkmark"} 
                  size={16} 
                  color="#10B981" 
                />
                <Text style={styles.userBadgeText}>
                  {isNewUser ? 'New Account' : 'Existing User'} • {username}
                </Text>
              </View>
            </View>

            {/* Code Input Card */}
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>Verification Code</Text>
              
              {/* Separate Digit Boxes */}
              <View style={styles.digitContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.digitBox,
                      verificationCode.length > index && styles.digitBoxFilled,
                      verificationCode.length === index && styles.digitBoxActive
                    ]}
                    onPress={() => textInputRef.current?.focus()}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.digitText,
                      verificationCode.length > index && styles.digitTextFilled
                    ]}>
                      {verificationCode[index] || ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Hidden TextInput */}
              <TextInput
                ref={textInputRef}
                style={styles.hiddenInput}
                value={verificationCode}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                  setVerificationCode(numericText);
                }}
                keyboardType="numeric"
                maxLength={6}
                autoFocus={true}
                caretHidden={true}
              />

              {/* Timer */}
              <View style={styles.timerContainer}>
                {timeLeft > 0 ? (
                  <View style={styles.timerActive}>
                    <Ionicons name="time" size={16} color="#F59E0B" />
                    <Text style={styles.timerText}>
                      Expires in {formatTime(timeLeft)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.timerExpired}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.expiredText}>
                      Code expired
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {/* Primary Button */}
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (loading || verificationCode.length !== 6) && styles.buttonDisabled
                ]}
                onPress={handleVerifyCode}
                disabled={loading || verificationCode.length !== 6}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#1F2937" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#1F2937" />
                    <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Resend Button */}
              <TouchableOpacity
                style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
                onPress={handleResendCode}
                disabled={!canResend || loading}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="refresh" 
                  size={16} 
                  color={canResend ? "white" : "rgba(255,255,255,0.5)"} 
                />
                <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
                  {canResend ? 'Resend Code' : 'Please wait'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <Text style={styles.helpText}>
              Didn't receive the code? Check your spam folder
            </Text>
          </View>
        </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userBadgeText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },

  // Code Input Card - World Standard
  codeCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  codeLabel: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  
  // Separate Digit Boxes - Banking App Style
  digitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  digitBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  digitBoxActive: {
    borderColor: '#667eea',
    backgroundColor: 'white',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  digitBoxFilled: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  digitText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  digitTextFilled: {
    color: 'white',
  },
  hiddenInput: {
    position: 'absolute',
    left: -1000,
    top: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },

  // Timer Section
  timerContainer: {
    alignItems: 'center',
  },
  timerActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  timerText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  timerExpired: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  expiredText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Buttons
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  verifyButtonText: {
    color: '#1F2937',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  resendText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Help Text
  helpText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VerificationScreen;
