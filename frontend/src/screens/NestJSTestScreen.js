import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNestJSAuth } from '../context/NestJSAuthContext';
import nestjsApiService from '../services/nestjsApiService';

const NestJSTestScreen = () => {
  const { user, isAuthenticated, loading, login, register, logout, testConnection, clearError } = useNestJSAuth();
  
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Test User');
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addTestResult = (test, status, message) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runConnectionTest = async () => {
    setTesting(true);
    addTestResult('Connection Test', 'running', 'Testing NestJS backend connection...');
    
    const result = await testConnection();
    if (result.success) {
      addTestResult('Connection Test', 'success', 'NestJS backend is reachable!');
    } else {
      addTestResult('Connection Test', 'error', `Connection failed: ${result.error}`);
    }
    setTesting(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    const result = await login({ email, password });
    if (result.success) {
      Alert.alert('Success', 'Login successful!');
      addTestResult('Login Test', 'success', `Logged in as: ${result.user?.email || email}`);
    } else {
      Alert.alert('Login Failed', result.error);
      addTestResult('Login Test', 'error', `Login failed: ${result.error}`);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please enter all fields');
      return;
    }

    const result = await register({ email, password, name });
    if (result.success) {
      Alert.alert('Success', 'Registration successful!');
      addTestResult('Register Test', 'success', `User registered: ${email}`);
    } else {
      Alert.alert('Registration Failed', result.error);
      addTestResult('Register Test', 'error', `Registration failed: ${result.error}`);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      Alert.alert('Success', 'Logged out successfully!');
      addTestResult('Logout Test', 'success', 'User logged out');
    } else {
      addTestResult('Logout Test', 'error', `Logout failed: ${result.error}`);
    }
  };

  const testDataEndpoints = async () => {
    if (!isAuthenticated) {
      addTestResult('Data Test', 'warning', 'Please login first to test data endpoints');
      return;
    }

    setTesting(true);
    addTestResult('Data Test', 'running', 'Testing NestJS data endpoints...');

    try {
      // Test users endpoint
      const users = await nestjsApiService.getUsers();
      addTestResult('Users Endpoint', 'success', `Users loaded: ${users?.length || 0} items`);
    } catch (error) {
      addTestResult('Users Endpoint', 'error', `Users failed: ${error.message}`);
    }

    try {
      // Test documents endpoint
      const documents = await nestjsApiService.getDocuments();
      addTestResult('Documents Endpoint', 'success', `Documents loaded: ${documents?.length || 0} items`);
    } catch (error) {
      addTestResult('Documents Endpoint', 'error', `Documents failed: ${error.message}`);
    }

    setTesting(false);
  };

  const clearResults = () => {
    setTestResults([]);
    clearError();
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>NestJS Backend Connection Test</Text>
      
      <Text style={styles.subtitle}>
        Backend: http://localhost:3000/api/v1
      </Text>

      {isAuthenticated && user && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>✅ Authenticated as: {user.email}</Text>
          <Text style={styles.userText}>User ID: {user.id}</Text>
        </View>
      )}

      {/* Connection Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Connection Test</Text>
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={runConnectionTest}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Authentication Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Authentication Test</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.loginButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>

        {isAuthenticated && (
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]} 
            onPress={handleLogout}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Data Endpoints Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Data Endpoints Test</Text>
        <TouchableOpacity 
          style={[styles.button, styles.dataButton]} 
          onPress={testDataEndpoints}
          disabled={testing || !isAuthenticated}
        >
          <Text style={styles.buttonText}>
            {!isAuthenticated ? 'Login Required' : testing ? 'Testing...' : 'Test Data Endpoints'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {/* Test Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Results</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={styles.buttonTextSecondary}>Clear Results</Text>
        </TouchableOpacity>

        <View style={styles.resultsContainer}>
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
              No test results yet. Run tests to see results here.
            </Text>
          )}
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Instructions:</Text>
        <Text style={styles.instructionText}>
          1. Make sure your NestJS backend is running on port 3000{'\n'}
          2. Test connection first{'\n'}
          3. Register a new user or login with existing credentials{'\n'}
          4. Test data endpoints after authentication{'\n'}
          5. This is completely separate from your existing mobile-backend
        </Text>
      </View>
    </ScrollView>
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
    marginBottom: 20,
    color: '#666',
    fontFamily: 'monospace',
  },
  userInfo: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  userText: {
    color: '#155724',
    fontSize: 14,
    marginBottom: 5,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testButton: {
    backgroundColor: '#17a2b8',
  },
  registerButton: {
    backgroundColor: '#28a745',
    flex: 0.48,
  },
  loginButton: {
    backgroundColor: '#007bff',
    flex: 0.48,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  dataButton: {
    backgroundColor: '#6f42c1',
  },
  clearButton: {
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
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  resultsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
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
    paddingVertical: 20,
  },
  instructions: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
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

export default NestJSTestScreen;