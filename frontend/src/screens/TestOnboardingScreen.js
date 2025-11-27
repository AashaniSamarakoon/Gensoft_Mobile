import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

// Simple test onboarding screen
const TestOnboardingScreen = () => {
  console.log('🧪 TestOnboardingScreen: Simple test component is rendering!');
  const router = useRouter();

  const handleContinue = () => {
    console.log('✅ TestOnboardingScreen: Continue pressed, going to welcome');
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>ONBOARDING TEST</Text>
        <Text style={styles.subtitle}>If you can see this, the onboarding screen is working!</Text>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue to Welcome</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestOnboardingScreen;