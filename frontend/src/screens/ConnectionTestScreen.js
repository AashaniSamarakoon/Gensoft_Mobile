import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import nestjsApiService from '../services/nestjsApiService';

const ConnectionTestScreen = ({ navigation }) => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, message, data = null) => {
    const result = {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testPing = async () => {
    try {
      setLoading(true);
      const response = await nestjsApiService.ping();
      addResult('Backend Ping', '✅ SUCCESS', 'Backend is reachable', response);
    } catch (error) {
      addResult('Backend Ping', '❌ FAILED', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testEcho = async () => {
    try {
      setLoading(true);
      const testData = {
        message: 'Hello from React Native!',
        timestamp: new Date().toISOString(),
        device: 'Mobile App'
      };
      const response = await nestjsApiService.echo(testData);
      addResult('Echo Test', '✅ SUCCESS', 'Data exchange working', response);
    } catch (error) {
      addResult('Echo Test', '❌ FAILED', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testCORS = async () => {
    try {
      setLoading(true);
      const response = await nestjsApiService.corsTest();
      addResult('CORS Test', '✅ SUCCESS', 'CORS configured correctly', response);
    } catch (error) {
      addResult('CORS Test', '❌ FAILED', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    try {
      setLoading(true);
      const response = await nestjsApiService.healthCheck();
      addResult('Health Check', '✅ SUCCESS', 'Backend health OK', response);
    } catch (error) {
      addResult('Health Check', '❌ FAILED', error.message);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testPing();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testEcho();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testCORS();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testHealthCheck();
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      <Text style={styles.subtitle}>NestJS Backend: http://192.168.1.55:3001/api/v1</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runAllTests}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Run All Tests</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={testPing}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Ping</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={testEcho}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Echo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={testCORS}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>CORS</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={testHealthCheck}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Health</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={styles.clearButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results ({testResults.length})</Text>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultTime}>{result.timestamp}</Text>
            <Text style={styles.resultTest}>{result.test}</Text>
            <Text style={[
              styles.resultStatus,
              result.status.includes('SUCCESS') ? styles.success : styles.error
            ]}>
              {result.status}
            </Text>
            <Text style={styles.resultMessage}>{result.message}</Text>
            {result.data && (
              <Text style={styles.resultData}>
                {JSON.stringify(result.data, null, 2)}
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButton: {
    backgroundColor: '#28a745',
    flex: 1,
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  resultTime: {
    fontSize: 12,
    color: '#999',
  },
  resultTest: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  success: {
    color: '#28a745',
  },
  error: {
    color: '#dc3545',
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  resultData: {
    fontSize: 12,
    color: '#007bff',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 10,
    marginTop: 5,
    borderRadius: 4,
  },
});

export default ConnectionTestScreen;