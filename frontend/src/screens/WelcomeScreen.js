import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../context/AuthContext';
import LogisticsBackground from '../components/LogisticsBackground';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const { accounts } = useAuth();

  const handleLoginWithEmail = () => {
    console.log('🔑 Login with Email clicked - Available accounts:', accounts?.length || 0);
    console.log('📋 Accounts data:', accounts);
    
    // Check if there are saved accounts
    if (accounts && accounts.length > 0) {
      console.log('➡️ Navigating to SavedAccounts screen');
      // Navigate to saved accounts screen
      navigation.navigate('SavedAccounts');
    } else {
      console.log('➡️ No saved accounts, navigating to Login screen');
      // Navigate directly to login screen
      navigation.navigate('Login');
    }
  };
  return (
    <LogisticsBackground colors={['#667eea', '#764ba2']}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Logo and Title */}
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000}
            style={styles.logoContainer}
          >
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/gensoft-logo.jpg')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>Gensoft ERP</Text>
            <Text style={styles.subtitle}>Smart Logistics Management System</Text>
          </Animatable.View>

          {/* Features */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={1000}
            delay={500}
            style={styles.featuresContainer}
          >
            <View style={styles.featureItem}>
              <Ionicons name="qr-code" size={20} color="#ffffff" />
              <Text style={styles.featureText}>QR Code Registration</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={20} color="#ffffff" />
              <Text style={styles.featureText}>Real-time Analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
              <Text style={styles.featureText}>Secure & Reliable</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="cube" size={20} color="#ffffff" />
              <Text style={styles.featureText}>Inventory Management</Text>
            </View>
          </Animatable.View>

          {/* Action Buttons */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={1000}
            delay={1000}
            style={styles.buttonsContainer}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('QRScanner')}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code-outline" size={20} color="#667eea" />
              <Text style={styles.primaryButtonText}>Scan QR to Register</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLoginWithEmail}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={20} color="#ffffff" />
              <Text style={styles.secondaryButtonText}>Login to Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tertiaryButton}
              onPress={() => navigation.navigate('Onboarding')}
              activeOpacity={0.8}
            >
              <Ionicons name="help-circle-outline" size={16} color="#ffffff" />
              <Text style={styles.tertiaryButtonText}>App Tour</Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Footer */}
          <Animatable.View 
            animation="fadeIn" 
            duration={1000}
            delay={1500}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              New user? Scan QR code to register • Existing user? Login with email
            </Text>
          </Animatable.View>
        </View>
      </SafeAreaView>
    </LogisticsBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    paddingVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  featureText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  buttonsContainer: {
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  primaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  tertiaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tertiaryButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default WelcomeScreen;
