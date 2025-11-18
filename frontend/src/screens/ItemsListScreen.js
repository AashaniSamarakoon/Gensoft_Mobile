import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const ItemsListScreen = ({ navigation }) => {
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
            <Text style={styles.headerTitle}>Items</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerIconButton}>
                <Ionicons name="add" size={24} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.comingSoonContainer}>
          <Ionicons name="cube-outline" size={80} color={theme.colors.primary} />
          <Text style={[styles.comingSoonTitle, { color: theme.colors.text }]}>
            Items Management
          </Text>
          <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
            This feature is coming soon. You'll be able to manage your inventory items here.
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

export default ItemsListScreen;