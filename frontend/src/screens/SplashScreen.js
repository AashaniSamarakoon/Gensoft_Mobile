import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogisticsBackground from '../components/LogisticsBackground';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    let isMounted = true;
    
    // Start animations only once
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(textSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to next screen after animation completes (following backup OnboardingStack pattern)
    const timer = setTimeout(async () => {
      if (!isMounted) return;
      
      try {
        const onboardingComplete = await AsyncStorage.getItem('@onboarding_complete');
        console.log('🔍 Splash: Checking onboarding status:', onboardingComplete);
        
        if (onboardingComplete === 'true') {
          // User has completed onboarding, go to welcome
          console.log('🏠 Splash: Onboarding completed, going to welcome');
          router.replace('/(auth)/welcome');
        } else {
          // First time user, show onboarding screens
          console.log('📚 Splash: First time user, showing onboarding');
          router.replace('/(auth)/onboarding');
        }
      } catch (error) {
        console.error('Splash: Error checking onboarding status:', error);
        // Default to onboarding on error (safe fallback)
        router.replace('/(auth)/onboarding');
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);



  return (
    <LogisticsBackground colors={['#667eea', '#764ba2']}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Animated Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/gensoft-logo.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Animated Text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: textSlide }],
              },
            ]}
          >
            <Text style={styles.title}>Gensoft ERP</Text>
            <Text style={styles.subtitle}>Logistics Management System</Text>
            <View style={styles.loadingContainer}>
              <Animated.View
                style={[
                  styles.loadingDot,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.loadingDot,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.loadingDot,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              />
            </View>
          </Animated.View>

          {/* Version */}
          <Animated.View
            style={[
              styles.versionContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.version}>Version 1.0.0</Text>
            <Text style={styles.copyright}>© 2025 Gensoft</Text>
          </Animated.View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
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
    marginBottom: 30,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default SplashScreen;
