import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StorageRecoveryUtil from '../services/StorageRecoveryUtil';
import LocalStorageService from '../services/LocalStorageService';
import AsyncStorageWrapper from '../utils/AsyncStorageWrapper';
import ImmediateCorruptionFix from '../utils/ImmediateCorruptionFix';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error: error 
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('🚨 Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Check if it's a storage-related error
    if (this.isStorageError(error)) {
      console.log('🔧 Storage error detected, initiating recovery...');
      this.handleStorageError();
    }
  }

  isStorageError = (error) => {
    const errorString = error.toString().toLowerCase();
    return (
      errorString.includes('json') ||
      errorString.includes('parse') ||
      errorString.includes('storage') ||
      errorString.includes('asyncstorage') ||
      errorString.includes('unexpected character')
    );
  };

  handleStorageError = async () => {
    try {
      console.log('🚨 ErrorBoundary detected storage error, running immediate fix...');
      
      // Run immediate corruption fix for "character e" error
      const immediateResult = await ImmediateCorruptionFix.runCompleteFix();
      
      if (immediateResult.success && immediateResult.totalFixed > 0) {
        Alert.alert(
          'Storage Error Fixed',
          `Fixed ${immediateResult.totalFixed} corrupted entries. The "character e" error should be resolved.`,
          [
            { text: 'Restart App', onPress: () => this.restartApp() }
          ]
        );
        return;
      }

      // Fallback to original recovery
      const result = await StorageRecoveryUtil.performEmergencyCleanup();
      
      if (result.success) {
        Alert.alert(
          'Data Corruption Fixed',
          'Corrupted app data has been cleaned up. Please restart the app.',
          [
            { text: 'Restart App', onPress: () => this.restartApp() }
          ]
        );
      } else {
        this.showManualRecoveryOptions();
      }
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      this.showManualRecoveryOptions();
    }
  };

  showManualRecoveryOptions = () => {
    Alert.alert(
      'App Data Issue',
      'The app encountered a data corruption issue. Choose a recovery option:',
      [
        { 
          text: 'Clear App Data', 
          onPress: this.performManualCleanup,
          style: 'destructive'
        },
        { 
          text: 'Restart App', 
          onPress: this.restartApp 
        },
        { 
          text: 'Continue Anyway', 
          onPress: () => this.setState({ hasError: false }),
          style: 'cancel'
        }
      ]
    );
  };

  performManualCleanup = async () => {
    this.setState({ isRecovering: true });
    
    try {
      await StorageRecoveryUtil.performEmergencyCleanup();
      
      Alert.alert(
        'Cleanup Complete',
        'App data has been cleared. Please restart the app.',
        [
          { text: 'OK', onPress: this.restartApp }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Cleanup Failed',
        'Please restart the app or reinstall if issues persist.',
        [
          { text: 'OK', onPress: this.restartApp }
        ]
      );
    }
    
    this.setState({ isRecovering: false });
  };

  restartApp = () => {
    // Clear the error state to restart the app
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRecovering: false 
    });
  };

  retryWithCleanup = async () => {
    this.setState({ isRecovering: true });
    
    try {
      // Run cleanup
      await LocalStorageService.cleanupCorruptedData();
      
      // Clear error state to retry
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        isRecovering: false 
      });
      
    } catch (error) {
      console.error('Cleanup retry failed:', error);
      this.setState({ isRecovering: false });
      this.showManualRecoveryOptions();
    }
  };

  render() {
    if (this.state.hasError) {
      const isStorageError = this.isStorageError(this.state.error);
      
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Ionicons 
              name={isStorageError ? "warning" : "alert-circle"} 
              size={60} 
              color="#FF6B6B" 
            />
            
            <Text style={styles.title}>
              {isStorageError ? 'Data Issue Detected' : 'Something Went Wrong'}
            </Text>
            
            <Text style={styles.message}>
              {isStorageError 
                ? 'The app detected corrupted data that needs to be cleaned up.'
                : 'An unexpected error occurred in the application.'
              }
            </Text>

            {isStorageError && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]}
                  onPress={this.retryWithCleanup}
                  disabled={this.state.isRecovering}
                >
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.buttonText}>
                    {this.state.isRecovering ? 'Fixing...' : 'Fix & Retry'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]}
                  onPress={this.showManualRecoveryOptions}
                >
                  <Ionicons name="settings" size={20} color="#007AFF" />
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    More Options
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!isStorageError && (
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={this.restartApp}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            )}

            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>
                  Error: {this.state.error?.toString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: 320,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  debugInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;