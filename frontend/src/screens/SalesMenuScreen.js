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

const SalesMenuScreen = ({ navigation }) => {
  const theme = useTheme();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const salesOptions = [
    {
      id: 'quotes',
      title: 'Sales Quotes',
      icon: 'document-outline',
      description: 'Create and manage sales quotes',
    },
    {
      id: 'orders',
      title: 'Sales Orders',
      icon: 'receipt-outline',
      description: 'Process and track sales orders',
    },
    {
      id: 'invoices',
      title: 'Sales Invoices',
      icon: 'card-outline',
      description: 'Generate and send invoices',
    },
    {
      id: 'customers',
      title: 'Customer Management',
      icon: 'people-outline',
      description: 'Manage customer information',
    },
  ];

  const SalesOption = ({ item }) => (
    <TouchableOpacity
      style={[styles.optionCard, { backgroundColor: theme.colors.surface }]}
      activeOpacity={0.7}
    >
      <View style={[styles.optionIcon, { backgroundColor: '#ea580c15' }]}>
        <Ionicons name={item.icon} size={28} color="#ea580c" />
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

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
            <Text style={styles.headerTitle}>Sales</Text>
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Sales Management
        </Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          Manage your sales processes from quotes to invoicing
        </Text>

        <View style={styles.optionsContainer}>
          {salesOptions.map((item) => (
            <SalesOption key={item.id} item={item} />
          ))}
        </View>

        <View style={styles.comingSoonNote}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.warning} />
          <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
            Sales module features are coming soon
          </Text>
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
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  comingSoonNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    padding: 16,
    gap: 8,
  },
  comingSoonText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default SalesMenuScreen;