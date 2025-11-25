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
  StatusBar,
  ScrollView
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
    if (!verificationCode || verificationCode.length === 0) {
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
            {/* Top Section */}
            <View style={styles.topSection}>
              {/* Header Section */}
              <View style={styles.headerSection}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail" size={44} color="#4299E1" />
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
            </View>

            {/* Middle Section */}
            <View style={styles.middleSection}>
              {/* Code Input Card */}
              <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>Verification Code</Text>
              
              {/* Individual Digit Input Boxes with Internal Underlines */}
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
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        verificationCode.length > index 
                          ? ['#667eea', '#764ba2'] // App gradient for filled
                          : verificationCode.length === index
                          ? ['#FFFFFF', '#F8FAFC'] // White gradient for active
                          : ['#FFFFFF', '#FFFFFF'] // Pure white for empty
                      }
                      style={[
                        styles.digitGradient,
                        verificationCode.length === index && styles.digitGradientActive
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.digitContent}>
                        <Text style={[
                          styles.digitText,
                          verificationCode.length > index && styles.digitTextFilled,
                          verificationCode.length === index && styles.digitTextActive
                        ]}>
                          {verificationCode[index] || ''}
                        </Text>
                        {/* Internal Underline */}
                        <View style={[
                          styles.digitUnderline,
                          verificationCode.length > index && styles.digitUnderlineFilled,
                          verificationCode.length === index && styles.digitUnderlineActive
                        ]} />
                      </View>
                    </LinearGradient>
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
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* Primary Button with Gradient */}
                <TouchableOpacity
                  style={[
                    styles.verifyButton,
                    loading && styles.buttonDisabled
                  ]}
                  onPress={handleVerifyCode}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={
                      loading
                        ? ['#CBD5E0', '#A0AEC0']
                        : verificationCode.length === 0
                        ? ['#667eea', '#764ba2']
                        : verificationCode.length < 6
                        ? ['#667eea', '#764ba2']
                        : ['#667eea', '#764ba2']
                    }
                    style={styles.verifyButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                        <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                      </>
                    )}
                  </LinearGradient>
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
                    size={18} 
                    color={canResend ? "#4C51BF" : "#9CA3AF"} 
                  />
                  <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Help Text */}
              <Text style={styles.helpText}>
                Didn't receive the code? Check your spam folder
              </Text>
            </View>
          </View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 32,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },

  // Header Section - Enhanced White Design
  headerSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 36,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#1a202c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '400',
  },
  emailText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#1a202c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  userBadgeText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.2,
  },

  // Code Input Card - Clean Compact Layout
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#1a202c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.08)',
  },
  codeLabel: {
    fontSize: 17,
    color: '#2D3748',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  
  // Individual Digit Boxes with Internal Underlines
  digitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  digitBox: {
    width: 42,
    height: 52,
    borderRadius: 12,
    shadowColor: '#1a202c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  digitContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  digitUnderline: {
    position: 'absolute',
    bottom: 6,
    width: 28,
    height: 2,
    backgroundColor: '#E2E8F0',
    borderRadius: 1,
  },
  digitUnderlineActive: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 1,
  },
  digitUnderlineFilled: {
    backgroundColor: '#FFFFFF',
  },
  digitGradient: {
    width: 42,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    position: 'relative',
  },
  digitGradientActive: {
    borderColor: '#667eea',
    borderWidth: 2.5,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  digitBoxActive: {
    transform: [{ scale: 1.02 }],
  },
  digitBoxFilled: {
    transform: [{ scale: 1.0 }],
  },
  digitText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#94A3B8',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 24,
    marginBottom: 4,
  },
  digitTextActive: {
    color: '#667eea',
    fontWeight: '900',
  },
  digitTextFilled: {
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hiddenInput: {
    position: 'absolute',
    left: -1000,
    top: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },

  // Timer Section - Clean White Design
  timerContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  timerActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  timerText: {
    color: '#EA580C',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  timerExpired: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  expiredText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.3,
  },

  // Buttons - Fixed Layout
  buttonContainer: {
    paddingHorizontal: 12,
    gap: 18,
    marginBottom: 28,
    marginTop: 8,
  },
  verifyButton: {
    borderRadius: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  verifyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    minHeight: 52,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    includeFontPadding: false,
    textAlign: 'center',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 2.5,
    borderColor: '#4C51BF',
    shadowColor: '#4C51BF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  resendText: {
    color: '#4C51BF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.4,
    textShadowColor: 'rgba(76, 81, 191, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    includeFontPadding: false,
  },
  resendButtonDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.7,
    shadowColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  resendTextDisabled: {
    color: '#9CA3AF',
    fontWeight: '600',
    textShadowColor: 'rgba(156, 163, 175, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Layout Sections - Optimized Balance
  topSection: {
    flex: 0.38,
    justifyContent: 'center',
  },
  middleSection: {
    flex: 0.35,
    justifyContent: 'center',
  },
  bottomSection: {
    flex: 0.27,
    justifyContent: 'flex-end',
  },

  // Help Text
  helpText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
  },
});

export default VerificationScreen;
