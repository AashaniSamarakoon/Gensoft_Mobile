import { useRouter, useNavigation } from 'expo-router';

// Navigation utility that provides compatibility between React Navigation and Expo Router
export const useAppNavigation = () => {
  const router = useRouter();
  
  // Map old navigation methods to new Expo Router methods
  const navigate = (screenName, params) => {
    const routeMap = {
      // Auth routes
      'SavedAccounts': '/(auth)/saved-accounts',
      'Login': '/(auth)/login',
      'QRScanner': '/(auth)/qr-scanner',
      'Onboarding': '/(auth)/onboarding',
      'SetPassword': '/(auth)/set-password',
      'Verification': '/(auth)/verification',
      'Welcome': '/(auth)/welcome',
      'Splash': '/(auth)/splash',
      
      // Main app routes
      'Dashboard': '/(tabs)',
      'IOUHub': '/(tabs)/iou-hub',
      'IOUList': '/(tabs)/iou-list',
      'CreateIOU': '/(tabs)/create-iou',
      'IOUAnalytics': '/(tabs)/iou-analytics',
      'IOUExports': '/(tabs)/iou-exports',
      'IOUDetails': '/(tabs)/iou-details',
      'ApprovalsHub': '/(tabs)/approvals-hub',
      'PendingApprovals': '/(tabs)/pending-approvals',
      'ApprovalHistory': '/(tabs)/approval-history',
      'ModuleBasedApprovals': '/(tabs)/module-based-approvals',
      'ApprovalAnalytics': '/(tabs)/approval-analytics',
      'ApprovalExports': '/(tabs)/approval-exports',
      'ProofList': '/(tabs)/proof-list',
      'CreateProof': '/(tabs)/create-proof',
      'ProofDetails': '/(tabs)/proof-details',
      'SettlementList': '/(tabs)/settlement-list',
      'CreateSettlement': '/(tabs)/create-settlement',
      'ReportsList': '/(tabs)/reports-list',
      'Profile': '/(tabs)/profile',
      'Settings': '/(tabs)/settings',
    };
    
    const route = routeMap[screenName];
    if (route) {
      if (params) {
        router.push({ pathname: route, params });
      } else {
        router.push(route);
      }
    } else {
      console.warn(`Route not found for screen: ${screenName}`);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const replace = (screenName, params) => {
    const routeMap = {
      // Auth routes
      'SavedAccounts': '/(auth)/saved-accounts',
      'Login': '/(auth)/login',
      'QRScanner': '/(auth)/qr-scanner',
      'Onboarding': '/(auth)/onboarding',
      'SetPassword': '/(auth)/set-password',
      'Verification': '/(auth)/verification',
      'Welcome': '/(auth)/welcome',
      'Splash': '/(auth)/splash',
      
      // Main app routes
      'Dashboard': '/(tabs)',
      'IOUHub': '/(tabs)/iou-hub',
      'IOUList': '/(tabs)/iou-list',
      'CreateIOU': '/(tabs)/create-iou',
      'IOUAnalytics': '/(tabs)/iou-analytics',
      'IOUExports': '/(tabs)/iou-exports',
      'IOUDetails': '/(tabs)/iou-details',
      'ApprovalsHub': '/(tabs)/approvals-hub',
      'PendingApprovals': '/(tabs)/pending-approvals',
      'ApprovalHistory': '/(tabs)/approval-history',
      'ModuleBasedApprovals': '/(tabs)/module-based-approvals',
      'ApprovalAnalytics': '/(tabs)/approval-analytics',
      'ApprovalExports': '/(tabs)/approval-exports',
      'ProofList': '/(tabs)/proof-list',
      'CreateProof': '/(tabs)/create-proof',
      'ProofDetails': '/(tabs)/proof-details',
      'SettlementList': '/(tabs)/settlement-list',
      'CreateSettlement': '/(tabs)/create-settlement',
      'ReportsList': '/(tabs)/reports-list',
      'Profile': '/(tabs)/profile',
      'Settings': '/(tabs)/settings',
    };
    
    const route = routeMap[screenName];
    if (route) {
      if (params) {
        router.replace({ pathname: route, params });
      } else {
        router.replace(route);
      }
    } else {
      console.warn(`Route not found for screen: ${screenName}`);
    }
  };

  return {
    navigate,
    goBack,
    replace,
    push: navigate,
  };
};