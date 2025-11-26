import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAppNavigation } from '../utils/navigation';

const { width, height } = Dimensions.get('window');

const NavigationDrawer = ({ visible, onClose }) => {
  const { user, company } = useAuth();
  const theme = useTheme();
  const navigation = useAppNavigation();

  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'grid',
      iconOutline: 'grid-outline',
      route: 'Dashboard',
      color: '#000000',
    },
    {
      id: 'transactions',
      title: 'Transactions',
      icon: 'card',
      iconOutline: 'card-outline',
      color: '#000000',
      hasSubmenu: true,
      submenu: [
        {
          id: 'iou-hub',
          title: 'IOU Management',
          icon: 'receipt',
          route: 'IOUHub',
        },
        {
          id: 'iou-list',
          title: 'IOU List',
          icon: 'list',
          route: 'IOUList',
        },
        {
          id: 'create-iou',
          title: 'Create IOU',
          icon: 'add-circle',
          route: 'CreateIOU',
        },
        {
          id: 'iou-analytics',
          title: 'IOU Analytics',
          icon: 'analytics',
          route: 'IOUAnalytics',
        },
      ],
    },
    {
      id: 'documents',
      title: 'Documents',
      icon: 'document',
      iconOutline: 'document-outline',
      color: '#000000',
      hasSubmenu: true,
      submenu: [
        {
          id: 'proof-list',
          title: 'Proof List',
          icon: 'document-text',
          route: 'ProofList',
        },
        {
          id: 'create-proof',
          title: 'Create Proof',
          icon: 'camera',
          route: 'CreateProof',
        },
        {
          id: 'proof-details',
          title: 'Proof Details',
          icon: 'eye',
          route: 'ProofDetails',
        },
      ],
    },
    {
      id: 'settlements',
      title: 'Settlements',
      icon: 'wallet',
      iconOutline: 'wallet-outline',
      color: '#000000',
      hasSubmenu: true,
      submenu: [
        {
          id: 'settlement-list',
          title: 'Settlement List',
          icon: 'list-circle',
          route: 'SettlementList',
        },
        {
          id: 'create-settlement',
          title: 'Create Settlement',
          icon: 'add',
          route: 'CreateSettlement',
        },
      ],
    },
    {
      id: 'approvals',
      title: 'Approvals',
      icon: 'checkmark-circle',
      iconOutline: 'checkmark-circle-outline',
      color: '#000000',
      hasSubmenu: true,
      submenu: [
        {
          id: 'approvals-hub',
          title: 'Approvals Hub',
          icon: 'business',
          route: 'ApprovalsHub',
        },
        {
          id: 'pending-approvals',
          title: 'Pending Approvals',
          icon: 'time',
          route: 'PendingApprovals',
        },
        {
          id: 'approval-history',
          title: 'Approval History',
          icon: 'archive',
          route: 'ApprovalHistory',
        },
      ],
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'bar-chart',
      iconOutline: 'bar-chart-outline',
      route: 'ReportsList',
      color: '#000000',
    },
    {
      id: 'account',
      title: 'Account',
      icon: 'person',
      iconOutline: 'person-outline',
      color: '#000000',
      hasSubmenu: true,
      submenu: [
        {
          id: 'profile',
          title: 'Profile',
          icon: 'person-circle',
          route: 'Profile',
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: 'settings',
          route: 'Settings',
        },
      ],
    },
  ];

  const handleMenuPress = (item) => {
    console.log('🖱️ Menu item pressed:', item.title, 'route:', item.route);
    
    if (!navigation) {
      console.error('❌ Navigation prop is missing!');
      return;
    }
    
    // If item has submenu, toggle expansion instead of navigating
    if (item.hasSubmenu) {
      toggleSubmenu(item.id);
      return;
    }
    
    // Set active menu
    setActiveMenu(item.route);
    
    // Close drawer with slight delay for visual feedback
    setTimeout(() => {
      onClose();
    }, 150);
    
    // Navigate to the selected screen
    try {
      console.log('🔄 Attempting navigation to:', item.route);
      navigation.navigate(item.route);
      console.log('✅ Navigation successful to:', item.route);
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  };

  const handleSubmenuPress = (item) => {
    if (!navigation) return;
    
    setActiveMenu(item.route);
    
    setTimeout(() => {
      onClose();
    }, 150);
    
    try {
      navigation.navigate(item.route);
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  };

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const MenuItem = ({ item, index }) => {
    const isActive = activeMenu === item.route;
    const isExpanded = expandedMenus[item.id];
    const iconName = isActive || isExpanded ? item.icon : item.iconOutline;

    return (
      <View>
        <TouchableOpacity
          style={[
            styles.menuItem,
            (isActive || isExpanded) && styles.menuItemActive,
          ]}
          onPress={() => handleMenuPress(item)}
          activeOpacity={0.8}
        >
          {/* Active indicator */}
          {(isActive || isExpanded) && <View style={[styles.activeIndicator, { backgroundColor: '#000000' }]} />}
          
          {/* Icon with black color */}
          <View style={styles.menuIconContainer}>
            <View style={[
              styles.iconContainer,
              (isActive || isExpanded) && styles.iconContainerActive
            ]}>
              <Ionicons 
                name={iconName} 
                size={22} 
                color={(isActive || isExpanded) ? '#ffffff' : '#000000'} 
              />
            </View>
          </View>
          
          {/* Text Container */}
          <View style={styles.menuTextContainer}>
            <Text style={[
              styles.menuTitle,
              { color: (isActive || isExpanded) ? '#000000' : '#374151' },
              (isActive || isExpanded) && styles.menuTitleActive
            ]}>
              {item.title}
            </Text>
          </View>

          {/* Dropdown arrow for submenu items */}
          {item.hasSubmenu && (
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={18} 
              color="#000000" 
              style={styles.chevron}
            />
          )}
        </TouchableOpacity>
        
        {/* Submenu items */}
        {item.hasSubmenu && isExpanded && (
          <View style={styles.submenuContainer}>
            {item.submenu.map((subItem, subIndex) => (
              <TouchableOpacity
                key={subItem.id}
                style={[
                  styles.submenuItem,
                  activeMenu === subItem.route && styles.submenuItemActive
                ]}
                onPress={() => handleSubmenuPress(subItem)}
                activeOpacity={0.8}
              >
                <View style={styles.submenuIconContainer}>
                  <Ionicons 
                    name={subItem.icon} 
                    size={18} 
                    color={activeMenu === subItem.route ? '#000000' : '#6b7280'}
                  />
                </View>
                <Text style={[
                  styles.submenuTitle,
                  { color: activeMenu === subItem.route ? '#000000' : '#6b7280' },
                  activeMenu === subItem.route && styles.submenuTitleActive
                ]}>
                  {subItem.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1} 
          onPress={onClose}
        />
        
        {/* Drawer with slide animation from left */}
        {visible && (
          <Animatable.View
            animation="slideInLeft"
            duration={300}
            useNativeDriver={false}
            style={[styles.drawer, { backgroundColor: '#ffffff' }]}
          >
          {/* Modern Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.drawerHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <SafeAreaView>
              <View style={styles.drawerHeaderContent}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {/* User Profile Section */}
              <Animatable.View 
                animation="fadeInDown" 
                delay={200} 
                duration={600}
                style={styles.userProfileSection}
              >
                <View style={styles.userInfo}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                    style={styles.userAvatar}
                  >
                    <Ionicons name="person" size={32} color="#fff" />
                  </LinearGradient>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {company?.name || 'Gensoft Pty Ltd'}
                    </Text>
                    <Text style={styles.userEmail}>
                      {user?.email || 'ashanisamarakoon36@gmail.com'}
                    </Text>
                    <View style={styles.statusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Online</Text>
                    </View>
                  </View>
                </View>
              </Animatable.View>
            </SafeAreaView>
          </LinearGradient>

          {/* Menu Content */}
          <ScrollView 
            style={styles.menuContent} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuContentContainer}
          >
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>MAIN MENU</Text>
              {menuItems.map((item, index) => (
                <MenuItem key={item.id} item={item} index={index} />
              ))}
            </View>

            {/* Modern Footer */}
            <View style={styles.drawerFooter}>
              <View style={styles.footerDivider} />
              <View style={styles.footerContent}>
                <View style={styles.appInfoRow}>
                  <Ionicons name="apps" size={16} color="#94a3b8" />
                  <Text style={styles.footerAppName}>Logistics ERP</Text>
                  <View style={styles.versionBadge}>
                    <Text style={styles.versionText}>v1.0.0</Text>
                  </View>
                </View>
                <Text style={styles.footerCopyright}>
                  © 2025 Gensoft Pty Ltd
                </Text>
              </View>
            </View>
          </ScrollView>
          </Animatable.View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: Math.min(width * 0.85, 340),
    backgroundColor: '#ffffff',
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 1000,
  },
  
  // Header Styles
  drawerHeader: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 45 : 60,
    paddingBottom: 25,
    paddingHorizontal: 24,
    borderTopRightRadius: 20,
    minHeight: Platform.OS === 'android' ? 160 : 180,
  },
  drawerHeaderContent: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 0,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userProfileSection: {
    marginTop: 10,
    paddingBottom: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  userDetails: {
    flex: 1,
    paddingTop: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Menu Styles
  menuContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  menuContentContainer: {
    paddingBottom: 30,
    flexGrow: 1,
  },
  menuSection: {
    paddingTop: 20,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 16,
    marginLeft: 24,
    textTransform: 'uppercase',
  },
  
  // Menu Item Styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 16,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: '#f8fafc',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    width: 4,
    height: '70%',
    borderRadius: 2,
  },
  menuIconContainer: {
    marginRight: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconContainerActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  menuTitleActive: {
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 8,
  },
  
  // Submenu Styles
  submenuContainer: {
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 4,
    borderRadius: 14,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#000000',
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  submenuItemActive: {
    backgroundColor: '#ffffff',
  },
  submenuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  submenuTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  submenuTitleActive: {
    fontWeight: '600',
  },
  
  // Footer Styles
  drawerFooter: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 20,
  },
  footerContent: {
    alignItems: 'center',
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerAppName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    marginRight: 8,
  },
  versionBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  footerCopyright: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default NavigationDrawer;