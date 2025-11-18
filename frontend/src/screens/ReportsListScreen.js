import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const ReportsListScreen = ({ navigation }) => {
  const theme = useTheme();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reports</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerIconButton}>
                <Ionicons name="download" size={24} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.comingSoonContainer}>
          <Ionicons name="bar-chart-outline" size={80} color="#e11d48" />
          <Text style={[styles.comingSoonTitle, { color: theme.colors.text }]}>
            Reports & Analytics
          </Text>
          <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
            Generate comprehensive reports and analytics for your business operations.
          </Text>
          
          <TouchableOpacity 
            style={[styles.backToDashboardButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.backToDashboardText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  headerSafeArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonContainer: {
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    maxWidth: 300,
  },
  backToDashboardButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToDashboardText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportsListScreen;