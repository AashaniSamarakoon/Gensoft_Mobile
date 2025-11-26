import React, { useState } from 'react';
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
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppNavigation } from '../utils/navigation';
import nestjsApiService from '../../services/nestjsApiService';
// Note: Password hashing will be done on the backend for security

const SetPasswordScreen = () => {
  const { userId, username, email, employeeId, isNewUser } = useLocalSearchParams();
  const navigation = useAppNavigation();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation
  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(pwd)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(pwd)) return 'Password must contain at least one special character (@$!%*?&)';
    return null;
  };

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(pwd)) strength++;
    if (/(?=.*[A-Z])/.test(pwd)) strength++;
    if (/(?=.*\d)/.test(pwd)) strength++;
    if (/(?=.*[@$!%*?&])/.test(pwd)) strength++;
    
    if (strength <= 2) return { level: 'Weak', color: '#ff4757', width: '33%' };
    if (strength <= 4) return { level: 'Good', color: '#ffa502', width: '66%' };
    return { level: 'Strong', color: '#2ed573', width: '100%' };
  };

  const handleSetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Invalid Password', passwordError);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Setting password for user:', { userId, username, email, employeeId });

      // Use the dedicated NestJS API service
      const data = await nestjsApiService.setMobilePassword(email, password, confirmPassword);

      if (data.success) {
        console.log('✅ Password set successfully');
        
        // Show success message and let user navigate manually
        console.log('✅ Password set successfully for user:', username);
        
        // Create a function to handle navigation - go to login screen
        const handleContinue = () => {
          console.log('🔥 CONTINUE button pressed - navigating to login screen');
          console.log('📍 Will navigate to login with username:', username);
          
          setTimeout(() => {
            try {
              console.log('🔄 Navigating to login screen after successful password setup...');
              
              // Navigate to login screen with pre-filled username
              router.push({
                pathname: '/(auth)/login',
                params: {
                  preFilledUsername: username,
                  message: 'Password created successfully! Please login with your credentials.',
                  showMessage: 'true'
                }
              });
              
              console.log('✅ Successfully navigated to login screen');
              
            } catch (navigationError) {
              console.error('❌ Navigation to login failed, trying fallback...', navigationError);
              
              // Fallback: Try direct navigation to login
              try {
                router.replace('/(auth)/login');
                console.log('✅ Fallback navigation to login successful');
              } catch (fallbackError) {
                console.error('❌ Fallback navigation failed:', fallbackError);
                
                // Final fallback - show instructions
                Alert.alert(
                  'Password Created Successfully!',
                  `Your password has been set. Please navigate to the login screen and use username: "${username}"`,
                  [{ text: 'OK' }]
                );
              }
            }
          }, 100);
        };
        
        // Show alert with proper button handling
        Alert.alert(
          'Success!',
          'Your password has been set successfully. Redirecting to login...',
          [
            {
              text: 'CONTINUE',
              onPress: handleContinue,
              style: 'default'
            }
          ],
          { 
            cancelable: false,
            onDismiss: () => {
              console.log('⚠️ Alert was dismissed without button press');
              handleContinue(); // Call handler anyway
            }
          }
        );
      } else {
        console.error('❌ Set password failed:', data.error);
        
        // Handle specific error for user already exists
        const errorMessage = data.error || data.message || 'Failed to set password. Please try again.';
        
        if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
          Alert.alert(
            'Account Already Exists',
            'This account is already registered with a password. Would you like to go to the login page to access your account?',
            [
              {
                text: 'Go to Login',
                onPress: () => {
                  router.push({
                    pathname: '/(auth)/login',
                    params: {
                      preFilledUsername: username,
                      message: 'Account already exists - please enter your password',
                      showMessage: 'true'
                    }
                  });
                }
              },
              {
                text: 'Try Again',
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error) {
      console.error('Set password error:', error);
      
      // Check if error message indicates user already exists
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
        Alert.alert(
          'Account Already Exists',
          'This account is already registered. Please use the login page to access your account.',
          [
            {
              text: 'Go to Login',
              onPress: () => {
                router.push({
                  pathname: '/(auth)/login',
                  params: {
                    preFilledUsername: username,
                    message: 'Account already exists - please enter your password',
                    showMessage: 'true'
                  }
                });
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="lock-closed-outline" size={80} color="white" />
              <Text style={styles.title}>Set Login Password</Text>
              <Text style={styles.subtitle}>
                Create a secure password for your account
              </Text>
            </View>

            {/* User Info Card */}
            <View style={styles.userCard}>
              <Text style={styles.userLabel}>
                {isNewUser ? '🆕 New Account Setup' : '🔐 Account Security'}
              </Text>
              <Text style={styles.userName}>👤 {username}</Text>
              <Text style={styles.userEmail}>📧 {email}</Text>
            </View>

            {/* Password Input Form */}
            <View style={styles.formContainer}>
              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#667eea" 
                  />
                </TouchableOpacity>
              </View>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    <View 
                      style={[
                        styles.strengthFill, 
                        { 
                          width: passwordStrength.width, 
                          backgroundColor: passwordStrength.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.level}
                  </Text>
                </View>
              )}

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#667eea" 
                  />
                </TouchableOpacity>
              </View>

              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <View style={styles.matchContainer}>
                  {password === confirmPassword ? (
                    <View style={styles.matchIndicator}>
                      <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                      <Text style={[styles.matchText, { color: '#2ed573' }]}>
                        Passwords match
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.matchIndicator}>
                      <Ionicons name="close-circle" size={16} color="#ff4757" />
                      <Text style={[styles.matchText, { color: '#ff4757' }]}>
                        Passwords do not match
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <Text style={styles.requirementText}>• At least 8 characters</Text>
                <Text style={styles.requirementText}>• One uppercase letter</Text>
                <Text style={styles.requirementText}>• One lowercase letter</Text>
                <Text style={styles.requirementText}>• One number</Text>
                <Text style={styles.requirementText}>• One special character (@$!%*?&)</Text>
              </View>

              {/* Set Password Button */}
              <TouchableOpacity
                style={[
                  styles.setPasswordButton,
                  (!password || !confirmPassword || password !== confirmPassword || validatePassword(password)) && styles.disabledButton
                ]}
                onPress={handleSetPassword}
                disabled={loading || !password || !confirmPassword || password !== confirmPassword || validatePassword(password)}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={20} color="white" style={styles.buttonIcon} />
                    <Text style={styles.setPasswordButtonText}>Set Password</Text>
                  </>
                )}
              </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    backdropFilter: 'blur(10px)',
  },
  userLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '600',
  },
  userName: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  strengthContainer: {
    marginBottom: 20,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#e1e8ed',
    borderRadius: 2,
    marginBottom: 5,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  matchContainer: {
    marginBottom: 20,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchText: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '500',
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  setPasswordButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonIcon: {
    marginRight: 10,
  },
  setPasswordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SetPasswordScreen;
