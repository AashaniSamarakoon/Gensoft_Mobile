import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AccountSwitcher from './AccountSwitcher';

const AppHeader = ({ title = 'Logistics ERP', showAccountSwitcher = true }) => {
  const { user, company } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{company?.name || 'No Company'}</Text>
      </View>
      
      {showAccountSwitcher && user && (
        <View style={styles.accountSection}>
          <AccountSwitcher style={styles.accountSwitcher} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  accountSection: {
    marginLeft: 15,
  },
  accountSwitcher: {
    backgroundColor: 'white',
    borderColor: '#ddd',
  },
});

export default AppHeader;