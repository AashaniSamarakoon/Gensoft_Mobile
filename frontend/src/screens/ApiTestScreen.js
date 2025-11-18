import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import apiService from '../../services/ApiService';
import { useReduxAuth } from '../context/ReduxAuthContext';

const ApiTestScreen = () => {
  const { isAuthenticated, user } = useReduxAuth();
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test, status, message) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runHealthCheck = async () => {
    try {
      addResult('Health Check', 'running', 'Testing backend connection...');
      const result = await apiService.healthCheck();
      addResult('Health Check', 'success', `Backend is healthy: ${JSON.stringify(result)}`);
    } catch (error) {
      addResult('Health Check', 'error', `Health check failed: ${error.message}`);
    }
  };

  const testAuthentication = async () => {
    try {
      addResult('Authentication Test', 'running', 'Testing auth endpoints...');
      
      // Test login with dummy credentials (this will likely fail, but we can see the connection)
      try {
        await apiService.login({
          email: 'test@example.com',
          password: 'testpassword'
        });
        addResult('Authentication Test', 'success', 'Login endpoint is working');
      } catch (error) {
        if (error.message.includes('401') || error.message.includes('Invalid') || error.message.includes('password')) {
          addResult('Authentication Test', 'warning', 'Auth endpoint is working (expected invalid credentials error)');
        } else {
          addResult('Authentication Test', 'error', `Auth test failed: ${error.message}`);
        }
      }
    } catch (error) {
      addResult('Authentication Test', 'error', `Auth test failed: ${error.message}`);
    }
  };

  const testDataEndpoints = async () => {
    if (!isAuthenticated) {
      addResult('Data Endpoints', 'warning', 'Skipping data tests - not authenticated');
      return;
    }

    try {
      addResult('Data Endpoints', 'running', 'Testing ERP data endpoints...');
      
      // Test IOUs endpoint
      try {
        const ious = await apiService.getIOUs();
        addResult('IOUs Endpoint', 'success', `IOUs loaded: ${ious.length || 0} items`);
      } catch (error) {
        addResult('IOUs Endpoint', 'error', `IOUs failed: ${error.message}`);
      }

      // Test Proofs endpoint
      try {
        const proofs = await apiService.getProofs();
        addResult('Proofs Endpoint', 'success', `Proofs loaded: ${proofs.length || 0} items`);
      } catch (error) {
        addResult('Proofs Endpoint', 'error', `Proofs failed: ${error.message}`);
      }

      // Test Dashboard endpoint
      try {
        const stats = await apiService.getDashboardStats();
        addResult('Dashboard Endpoint', 'success', `Dashboard stats loaded: ${JSON.stringify(stats)}`);
      } catch (error) {
        addResult('Dashboard Endpoint', 'error', `Dashboard failed: ${error.message}`);
      }

    } catch (error) {
      addResult('Data Endpoints', 'error', `Data test failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    addResult('Test Suite', 'info', 'Starting API connectivity tests...');
    
    await runHealthCheck();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await testAuthentication();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await testDataEndpoints();
    
    addResult('Test Suite', 'info', 'All tests completed!');
    setTesting(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'running': return '#007bff';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'running': return '🔄';
      default: return 'ℹ️';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NestJS Backend API Test</Text>
      
      <Text style={styles.subtitle}>
        Testing connection to: http://localhost:3000 (Combined Backend+Middleware)
      </Text>

      {isAuthenticated && (
        <Text style={styles.authStatus}>
          ✅ Authenticated as: {user?.email || 'Unknown user'}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runAllTests}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? 'Testing...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={clearResults}
          disabled={testing}
        >
          <Text style={styles.buttonTextSecondary}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result) => (
          <View key={result.id} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTest}>
                {getStatusIcon(result.status)} {result.test}
              </Text>
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
            <Text style={[
              styles.resultMessage,
              { color: getStatusColor(result.status) }
            ]}>
              {result.message}
            </Text>
          </View>
        ))}
        
        {testResults.length === 0 && (
          <Text style={styles.emptyText}>
            No test results yet. Click "Run All Tests" to test the API connection.
          </Text>
        )}
      </ScrollView>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Instructions:</Text>
        <Text style={styles.instructionText}>
          1. Make sure your combined backend+middleware server is running on port 3000{'\n'}
          2. Click "Run All Tests" to test the connection{'\n'}
          3. Green ✅ = Success, Red ❌ = Error, Yellow ⚠️ = Warning{'\n'}
          4. This tests your unified server (replaces ports 4000 & 5000)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
  authStatus: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#d4edda',
    borderRadius: 5,
    color: '#155724',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 0.48,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: '#6c757d',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    maxHeight: 400,
  },
  resultItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultTime: {
    fontSize: 12,
    color: '#999',
  },
  resultMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 50,
  },
  instructions: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default ApiTestScreen;