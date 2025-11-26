import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAppNavigation } from '../utils/navigation';

const { width, height } = Dimensions.get('window');

const NavigationDrawer = ({ visible, onClose }) => {
  const { user, company } = useAuth();
  const theme = useTheme();
  const navigation = useAppNavigation();

  const menuItems = [
    {
      id: 'home',
      title: 'Home',
      icon: 'home-outline',
      route: 'Dashboard',
    },
    {
      id: 'ious',
      title: 'IOUs',
      icon: 'receipt-outline',
      route: 'IOUList',
    },
    {
      id: 'proofs',
      title: 'Proofs',
      icon: 'document-text-outline',
      route: 'ProofList',
    },
    {
      id: 'settlements',
      title: 'Settlements',
      icon: 'wallet-outline',
      route: 'SettlementList',
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person-outline',
      route: 'Profile',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings-outline',
      route: 'Settings',
    },
  ];

  const handleMenuPress = (item) => {
    console.log('🖱️ Menu item pressed:', item.title, 'route:', item.route);
    console.log('🔍 Navigation object:', navigation ? 'Available' : 'Not available');
    
    if (!navigation) {
      console.error('❌ Navigation prop is missing!');
      return;
    }
    
    // Close drawer immediately
    onClose();
    
    // Navigate to the selected screen with error handling
    try {
      console.log('🔄 Attempting navigation to:', item.route);
      navigation.navigate(item.route);
      console.log('✅ Navigation successful to:', item.route);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      console.error('❌ Error details:', error.message);
    }
  };

  const MenuItem = ({ item }) => {
    const iconColor = theme.colors.text;
    const backgroundColor = theme.colors.surface;

    return (
      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: 'transparent' }]}
        onPress={() => {
          console.log('👆 Touch detected on menu item:', item.title);
          handleMenuPress(item);
        }}
        onPressIn={() => console.log('👆 Press In:', item.title)}
        onPressOut={() => console.log('👆 Press Out:', item.title)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        testID={`menu-item-${item.id}`}
        accessible={true}
        accessibilityLabel={`Navigate to ${item.title}`}
      >
        <View style={[styles.menuIconContainer, { backgroundColor: backgroundColor }]}>
          <Ionicons name={item.icon} size={24} color={iconColor} />
        </View>
        
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        {/* Drawer */}
        <View style={[styles.drawer, { backgroundColor: theme.colors.surface }]}>
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            style={styles.drawerHeader}
          >
            <SafeAreaView>
              <View style={styles.drawerHeaderContent}>
                <View style={styles.userInfo}>
                  <View style={[styles.userAvatar, { backgroundColor: theme.colors.white + '20' }]}>
                    <Ionicons name="person" size={28} color={theme.colors.white} />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: theme.colors.white }]}>
                      {company?.name || 'Gensoft Pty Ltd'}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.colors.white + 'CC' }]}>
                      {user?.email || 'ashanisamarakoon36@gmail.com'}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={24} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>

          <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
            <View style={styles.menuSection}>
              {menuItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </View>

            {/* Footer */}
            <View style={styles.drawerFooter}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Logistics ERP v1.0.0
              </Text>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                © 2025 Gensoft Pty Ltd
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    width: width * 0.85,
    maxWidth: 320,
    height: height,
    elevation: 10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  drawerHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  drawerHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    opacity: 0.9,
  },
  closeButton: {
    padding: 4,
  },
  menuContent: {
    flex: 1,
  },
  menuSection: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  submenuContainer: {
    paddingLeft: 20,
    backgroundColor: '#f8fafc',
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingLeft: 40,
  },
  submenuIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  submenuTitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  drawerFooter: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#f1f5f9',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default NavigationDrawer;