import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogisticsBackground from '../components/LogisticsBackground';

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
  console.log('🎯 OnboardingScreen: Component is being rendered!');
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);

  // Add a simple test to see if component mounts
  useEffect(() => {
    console.log('🔄 OnboardingScreen: Component mounted successfully');
    console.log('📊 OnboardingScreen: Current page:', currentPage);
    console.log('📱 OnboardingScreen: Total onboarding data items:', onboardingData.length);
  }, []);

  const onboardingData = [
    {
      id: 1,
      icon: 'cube-outline',
      title: 'Smart Logistics Management',
      description: 'Manage your shipments, track deliveries, and optimize routes with our intelligent logistics platform.',
      gradient: ['#667eea', '#764ba2']
    },
    {
      id: 2,
      icon: 'qr-code-outline',
      title: 'QR Code Integration',
      description: 'Quick registration and authentication using QR codes. Scan to join your organization instantly.',
      gradient: ['#667eea', '#764ba2']
    },
    {
      id: 3,
      icon: 'analytics-outline',
      title: 'Real-time Analytics',
      description: 'Get insights into your logistics operations with comprehensive dashboards and real-time tracking.',
      gradient: ['#667eea', '#764ba2']
    },
    {
      id: 4,
      icon: 'shield-checkmark-outline',
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control and encrypted data transmission.',
      gradient: ['#667eea', '#764ba2']
    }
  ];

  const handleNext = async () => {
    console.log('🔄 OnboardingScreen: Next button pressed, current page:', currentPage);
    if (currentPage < onboardingData.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });
      console.log('📱 OnboardingScreen: Moved to page:', nextPage);
    } else {
      // Mark onboarding as complete and set both flags
      console.log('✅ OnboardingScreen: Completed, marking as done and going to welcome');
      await AsyncStorage.setItem('@onboarding_complete', 'true');
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(auth)/welcome');
    }
  };

  const handleSkip = async () => {
    // Mark onboarding as complete and set both flags
    console.log('⏭️ OnboardingScreen: User skipped onboarding, marking as done and going to welcome');
    await AsyncStorage.setItem('@onboarding_complete', 'true');
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/welcome');
  };

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const pageIndex = Math.round(contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  const renderPage = (item, index) => (
    <View key={item.id} style={styles.pageContainer}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name={item.icon} size={60} color="#ffffff" />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  console.log('🎨 OnboardingScreen: About to render with currentPage:', currentPage, 'total pages:', onboardingData.length);
  
  return (
    <LogisticsBackground colors={['#667eea', '#764ba2']}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {onboardingData.map((item, index) => renderPage(item, index))}
        </ScrollView>

        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentPage ? styles.activeIndicator : styles.inactiveIndicator,
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons 
              name={currentPage === onboardingData.length - 1 ? 'checkmark' : 'arrow-forward'} 
              size={20} 
              color="#667eea" 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LogisticsBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  skipButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  pageContainer: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#ffffff',
    width: 20,
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  navigationContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  nextButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default OnboardingScreen;
