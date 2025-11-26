import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import LogisticsBackground from '../components/LogisticsBackground';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import nestjsApiService from '../../services/nestjsApiService';

const LoginScreen = () => {
  const { login, switchToAccount, isAuthenticated } = useAuth();
  const theme = useTheme();
  const params = useLocalSearchParams();
  
  // Get selected account info from route params
  const { selectedAccount, preFilledUsername, accountEmail, accountId, securityReason, message, showMessage } = params;
  
  // Debug logging to understand when LoginScreen is called
  console.log('🔍 LoginScreen rendered with params:', { selectedAccount, preFilledUsername, accountEmail, accountId, securityReason, message, showMessage });
  console.log('🔍 LoginScreen isAuthenticated:', isAuthenticated);
  
  const [username, setUsername] = useState(preFilledUsername || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update username if selectedAccount is provided
  useEffect(() => {
    if (preFilledUsername) {
      setUsername(preFilledUsername);
    }
  }, [preFilledUsername]);

  // Show success message if provided
  useEffect(() => {
    if (showMessage === 'true' && message) {
      setTimeout(() => {
        Alert.alert('Success', message, [{ text: 'OK' }]);
      }, 500); // Small delay to ensure screen is fully loaded
    }
  }, [showMessage, message]);

  const handleLogin = async () => {
    // Prevent login if user is already authenticated
    if (isAuthenticated) {
      console.log('🚫 Login prevented - user already authenticated');
      return;
    }

    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login for:', username);
      
      // If logging into a selected account, validate credentials match
      if (selectedAccount) {
        console.log('Validating credentials for selected account:', selectedAccount);
        
        // Verify the username matches the selected account
        if (username.trim() !== preFilledUsername) {
          Alert.alert('Error', 'Username does not match the selected account');
          setLoading(false);
          return;
        }
      }
      
      // Use the dedicated NestJS API service
      const data = await nestjsApiService.login(username.trim(), password.trim());
      console.log('Login response:', data);

      if (data.success && data.data && data.data.tokens && data.data.user) {
        // Login successful - use AuthContext to authenticate
        console.log('Login successful for user:', data.data.user);
        
        // Transform the response to match AuthContext expectations
        const authData = {
          token: data.data.tokens.accessToken,
          user: data.data.user,
          refreshToken: data.data.tokens.refreshToken,
          session: data.data.session,
          success: true,
          message: data.message
        };
        
        try {
          if (selectedAccount) {
            // Switch to the selected account with complete login data
            console.log('Switching to selected account:', data.data.user.username);
            await switchToAccount(authData);
          } else {
            // Regular login
            await login(authData);
          }
          console.log('✅ Authentication state updated successfully');
        } catch (authError) {
          console.error('❌ Error updating authentication state:', authError);
          Alert.alert('Error', 'Authentication error. Please try again.');
        }
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials. Please check your username and password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Connection Error', 'Unable to connect to server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <Ionicons name="people" size={50} color="#ffffff" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            {selectedAccount ? (
              <View style={styles.selectedAccountInfo}>
                <Text style={styles.subtitle}>Signing in as:</Text>
                <View style={styles.accountCard}>
                  <View style={styles.accountAvatar}>
                    <Text style={styles.avatarText}>
                      {selectedAccount.name ? selectedAccount.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>
                      {selectedAccount.name || 'User'}
                    </Text>
                    <Text style={styles.accountEmail}>
                      {accountEmail || selectedAccount.email || 'No email'}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={styles.subtitle}>Enter your credentials to continue</Text>
            )}
            
            {/* Security message */}
            {securityReason && (
              <Animatable.View 
                animation="fadeInUp" 
                duration={800}
                style={styles.securityMessage}
              >
                <View style={styles.securityIcon}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#FFA726" />
                </View>
                <Text style={styles.securityText}>{securityReason}</Text>
              </Animatable.View>
            )}
          </Animatable.View>

          {/* Form */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={1000}
            delay={300}
            style={styles.formContainer}
          >
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="rgba(255,255,255,0.7)" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <Text style={styles.loginButtonText}>Signing In...</Text>
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#667eea" />
                </>
              )}
            </TouchableOpacity>
          </Animatable.View>

          {/* Footer */}
          <Animatable.View 
            animation="fadeIn" 
            duration={1000}
            delay={600}
            style={styles.footer}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
              <Text style={styles.backButtonText}>
                {selectedAccount ? 'Back to Account Selection' : 'Back to Welcome'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={() => navigation.navigate('QRScanner')}
            >
              <Ionicons name="qr-code-outline" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.qrButtonText}>Don't have an account? Scan QR Code</Text>
            </TouchableOpacity>
          </Animatable.View>
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
  keyboardAvoidingView: {
    flex: 1,
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  footer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 10,
  },
  qrButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 10,
  },
  selectedAccountInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 15,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 250,
  },
  accountAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  securityMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 167, 38, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 167, 38, 0.3)',
    maxWidth: 300,
  },
  securityIcon: {
    marginRight: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#FFA726',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;
