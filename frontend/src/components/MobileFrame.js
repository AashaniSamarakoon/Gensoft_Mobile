import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const MobileFrame = ({ children, backgroundColor = '#f8f9fa' }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.phoneFrame, { backgroundColor }]}>
        <View style={styles.statusBar} />
        <View style={styles.content}>
          {children}
        </View>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  phoneFrame: {
    width: width > 400 ? 375 : width - 40,
    height: height > 700 ? 667 : height - 100,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 10,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  statusBar: {
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    flex: 1,
  },
  homeIndicator: {
    height: 5,
    width: 134,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },
});

export default MobileFrame;
