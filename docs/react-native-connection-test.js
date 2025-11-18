// React Native Connection Test Component
// Save this as ConnectionTest.js in your React Native project

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';

const API_BASE_URL = 'http://192.168.1.55:3000/api/v1';

export default function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('Not tested');
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, status, message) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testPing = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/network-test/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        addTestResult('Ping Test', '✅ SUCCESS', `Server responded: ${data.message}`);
        setConnectionStatus('Connected');
      } else {
        addTestResult('Ping Test', '❌ FAILED', `HTTP ${response.status}`);
        setConnectionStatus('Failed');
      }
    } catch (error) {
      addTestResult('Ping Test', '❌ ERROR', error.message);
      setConnectionStatus('Error');
    }
  };

  const testEcho = async () => {
    try {
      const testData = { 
        message: 'Hello from React Native!', 
        timestamp: new Date().toISOString(),
        device: 'React Native App'
      };
      
      const response = await fetch(`${API_BASE_URL}/network-test/echo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      if (response.ok) {
        const data = await response.json();
        addTestResult('Echo Test', '✅ SUCCESS', 'Data sent and received successfully');
      } else {
        addTestResult('Echo Test', '❌ FAILED', `HTTP ${response.status}`);
      }
    } catch (error) {
      addTestResult('Echo Test', '❌ ERROR', error.message);
    }
  };

  const testCORS = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/network-test/cors-test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        addTestResult('CORS Test', '✅ SUCCESS', 'CORS is configured correctly');
      } else {
        addTestResult('CORS Test', '❌ FAILED', `HTTP ${response.status}`);
      }
    } catch (error) {
      addTestResult('CORS Test', '❌ ERROR', error.message);
    }
  };

  const runAllTests = () => {
    setTestResults([]);
    testPing();
    setTimeout(testEcho, 1000);
    setTimeout(testCORS, 2000);
  };

  const clearResults = () => {
    setTestResults([]);
    setConnectionStatus('Not tested');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      <Text style={styles.subtitle}>Testing connection to: {API_BASE_URL}</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Connection Status: </Text>
        <Text style={[styles.status, 
          connectionStatus === 'Connected' ? styles.success : 
          connectionStatus === 'Failed' || connectionStatus === 'Error' ? styles.error : styles.neutral
        ]}>
          {connectionStatus}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Test Connection" onPress={testPing} />
        <Button title="Test Echo" onPress={testEcho} />
        <Button title="Test CORS" onPress={testCORS} />
        <Button title="Run All Tests" onPress={runAllTests} />
        <Button title="Clear Results" onPress={clearResults} />
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultTime}>{result.timestamp}</Text>
            <Text style={styles.resultTest}>{result.test}</Text>
            <Text style={styles.resultStatus}>{result.status}</Text>
            <Text style={styles.resultMessage}>{result.message}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
  neutral: {
    color: '#666',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
  },
  resultTest: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultMessage: {
    fontSize: 14,
    color: '#333',
  },
});

// Usage Instructions:
/*
1. Add this component to your React Native app
2. Make sure your backend is running on http://192.168.1.55:3000
3. Import and use this component to test the connection:

import ConnectionTest from './ConnectionTest';

export default function App() {
  return <ConnectionTest />;
}
*/