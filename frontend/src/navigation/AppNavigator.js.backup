import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ActivityIndicator, View, Text } from 'react-native';

// Screen Imports
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import QRMethodSelectionScreen from '../screens/QRMethodSelectionScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import VerificationScreen from '../screens/VerificationScreen';
import SetPasswordScreen from '../screens/SetPasswordScreen';
import AccountSelectionScreen from '../screens/AccountSelectionScreen';
import SavedAccountsScreen from '../screens/SavedAccountsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import IOUListScreen from '../screens/IOUListScreen';
import CreateIOUScreen from '../screens/CreateIOUScreen';
import ProofListScreen from '../screens/ProofListScreen';
import CreateProofScreen from '../screens/CreateProofScreen';
import SettlementListScreen from '../screens/SettlementListScreen';
import CreateSettlementScreen from '../screens/CreateSettlementScreen';
import SettlementDetailsScreen from '../screens/SettlementDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ItemsListScreen from '../screens/ItemsListScreen';
import BankingScreen from '../screens/BankingScreen';
import ReportsListScreen from '../screens/ReportsListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NestJSTestScreen from '../screens/NestJSTestScreen';
import ConnectionTestScreen from '../screens/ConnectionTestScreen';
import IOUHubScreen from '../screens/IOUHubScreen';
import ApprovalsHubScreen from '../screens/ApprovalsHubScreen';
import ModuleBasedApprovalsScreen from '../screens/ModuleBasedApprovalsScreen';
import ApprovalsScreen from '../screens/ApprovalsScreen';

const Stack = createStackNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
    <ActivityIndicator size="large" color="#667eea" />
    <Text style={{ marginTop: 16, fontSize: 16, color: '#64748b' }}>
      Loading ERP Mobile...
    </Text>
  </View>
);

const OnboardingStack = ({ hasLoggedOut }) => (
  <Stack.Navigator 
    initialRouteName={hasLoggedOut ? "Welcome" : "Splash"}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="QRMethodSelection" component={QRMethodSelectionScreen} />
    <Stack.Screen name="QRScanner" component={QRScannerScreen} />
    <Stack.Screen name="Verification" component={VerificationScreen} />
    <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
    <Stack.Screen name="AccountSelection" component={AccountSelectionScreen} />
    <Stack.Screen name="SavedAccounts" component={SavedAccountsScreen} />
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator 
    initialRouteName="Welcome"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen 
      name="QRMethodSelection" 
      component={QRMethodSelectionScreen}
    />
    <Stack.Screen 
      name="QRScanner" 
      component={QRScannerScreen}
    />
    <Stack.Screen 
      name="Verification" 
      component={VerificationScreen}
    />
    <Stack.Screen 
      name="SetPassword" 
      component={SetPasswordScreen}
    />
    <Stack.Screen 
      name="AccountSelection" 
      component={AccountSelectionScreen}
    />
    <Stack.Screen 
      name="SavedAccounts" 
      component={SavedAccountsScreen}
    />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator 
    initialRouteName="Dashboard"
    screenOptions={{
      headerStyle: { backgroundColor: '#667eea' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{ headerShown: false }} // Dashboard has custom header
    />
    <Stack.Screen 
      name="IOUList" 
      component={IOUListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreateIOU" 
      component={CreateIOUScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ProofList" 
      component={ProofListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreateProof" 
      component={CreateProofScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="SettlementList" 
      component={SettlementListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreateSettlement" 
      component={CreateSettlementScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="SettlementDetails" 
      component={SettlementDetailsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ItemsList" 
      component={ItemsListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Banking" 
      component={BankingScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ReportsList" 
      component={ReportsListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="IOUHub" 
      component={IOUHubScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ApprovalsHub" 
      component={ApprovalsHubScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ModuleBasedApprovals" 
      component={ModuleBasedApprovalsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Approvals" 
      component={ApprovalsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="NestJSTest" 
      component={NestJSTestScreen}
      options={{ 
        headerShown: true,
        title: "NestJS Backend Test",
        headerStyle: { backgroundColor: '#007bff' },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="ConnectionTest" 
      component={ConnectionTestScreen}
      options={{ 
        headerShown: true,
        title: "Backend Connection Test",
        headerStyle: { backgroundColor: '#28a745' },
        headerTintColor: '#fff',
      }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, loading, hasLoggedOut } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          <MainStack />
        ) : (
          <OnboardingStack hasLoggedOut={hasLoggedOut} />
        )}
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default AppNavigator;
