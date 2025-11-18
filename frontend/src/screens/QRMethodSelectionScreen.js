import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const QRMethodSelectionScreen = ({ navigation }) => {
  const handleLiveScanning = () => {
    navigation.navigate('QRScanner', { method: 'live' });
  };

  const handleImageUpload = () => {
    navigation.navigate('QRScanner', { method: 'image' });
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackToLogin}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Animatable.View animation="fadeInDown" delay={300}>
            <Text style={styles.title}>QR Code Login</Text>
            <Text style={styles.subtitle}>
              Choose how you want to scan your QR code
            </Text>
          </Animatable.View>
        </View>

        {/* Method Selection Cards */}
        <View style={styles.methodContainer}>
          {/* Live Scanning Option */}
          <Animatable.View animation="fadeInUp" delay={500}>
            <TouchableOpacity 
              style={styles.methodCard}
              onPress={handleLiveScanning}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.cardGradient}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="camera" size={50} color="#fff" />
                </View>
                <Text style={styles.methodTitle}>Live Scanning</Text>
                <Text style={styles.methodDescription}>
                  Use your camera to scan QR codes in real-time
                </Text>
                <View style={styles.features}>
                  <View style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>Real-time detection</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>Instant feedback</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          {/* Image Upload Option */}
          <Animatable.View animation="fadeInUp" delay={700}>
            <TouchableOpacity 
              style={styles.methodCard}
              onPress={handleImageUpload}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.cardGradient}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="image" size={50} color="#fff" />
                </View>
                <Text style={styles.methodTitle}>Upload QR Image</Text>
                <Text style={styles.methodDescription}>
                  Select a QR code image from your gallery or take a photo
                </Text>
                <View style={styles.features}>
                  <View style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>Gallery support</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>Photo capture</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </View>

        {/* Bottom Info */}
        <Animatable.View animation="fadeInUp" delay={900} style={styles.bottomInfo}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#FFB74D" />
            <Text style={styles.infoText}>
              Make sure your QR code contains valid employee information
            </Text>
          </View>
        </Animatable.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 60,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 20,
  },
  methodContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  methodCard: {
    marginVertical: 15,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 25,
    alignItems: 'center',
    minHeight: 200,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  methodTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  features: {
    alignSelf: 'stretch',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 8,
  },
  bottomInfo: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB74D',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 10,
    lineHeight: 18,
  },
});

export default QRMethodSelectionScreen;