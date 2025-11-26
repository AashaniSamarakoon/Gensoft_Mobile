import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAppNavigation } from '../utils/navigation';

const BottomNavigation = ({ activeRoute }) => {
  const theme = useTheme();
  const navigation = useAppNavigation();

  const navigationItems = [
    { key: 'Dashboard', icon: 'home', label: 'Home', route: 'Dashboard' },
    { key: 'IOUHub', icon: 'receipt', label: 'IOU', route: 'IOUHub' },
    { key: 'ApprovalsHub', icon: 'checkmark-circle', label: 'Approvals', route: 'ApprovalsHub' },
    { key: 'Reports', icon: 'document-text', label: 'Reports', route: 'ReportsList' },
    { key: 'Profile', icon: 'person', label: 'Profile', route: 'Profile' },
  ];

  const handleNavigation = (route) => {
    navigation.navigate(route);
  };

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.bottomNavigation}
    >
      {navigationItems.map((item) => {
        const isActive = activeRoute === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.navItem, isActive && styles.activeNavItem]}
            onPress={() => handleNavigation(item.route)}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={isActive ? theme.colors.white : 'rgba(255,255,255,0.7)'}
            />
            <Text
              style={[
                styles.navText,
                isActive && styles.activeNavText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 6,
  },
  navText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 3,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default BottomNavigation;