import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SessionManager from '../utils/SessionManager';
import { useAuth } from '../context/AuthContext';

const SessionStatusIndicator = ({ theme }) => {
  const { user } = useAuth();
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    checkSessionStatus();
  }, [user]);

  const checkSessionStatus = async () => {
    if (!user) return;
    
    try {
      const status = await SessionManager.validateDashboardAccess(user);
      setSessionInfo({
        valid: status.valid,
        lastLogin: status.lastLogin,
        daysSince: status.daysSince,
        timeSince: status.lastLogin ? SessionManager.getTimeSinceLogin(status.lastLogin) : null
      });
    } catch (error) {
      console.log('Error checking session status:', error);
    }
  };

  if (!sessionInfo || !sessionInfo.lastLogin) return null;

  const getStatusColor = () => {
    if (!sessionInfo.valid) return theme.colors.error;
    if (sessionInfo.daysSince >= 2) return theme.colors.warning;
    return theme.colors.success;
  };

  const getStatusIcon = () => {
    if (!sessionInfo.valid) return 'warning';
    if (sessionInfo.daysSince >= 2) return 'time';
    return 'checkmark-circle';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Ionicons 
        name={getStatusIcon()} 
        size={16} 
        color={getStatusColor()} 
        style={styles.icon}
      />
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Last login: {sessionInfo.timeSince}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    opacity: 0.8,
  },
});

export default SessionStatusIndicator;