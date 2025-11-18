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

const PurchasesMenuScreen = ({ navigation }) => {
  const theme = useTheme();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const purchaseOptions = [
    {
      id: 'orders',
      title: 'Purchase Orders',
      icon: 'basket-outline',
      description: 'Create and manage purchase orders',
    },
    {
      id: 'receipts',
      title: 'Goods Receipt',
      icon: 'checkmark-circle-outline',
      description: 'Record received goods and materials',
    },
    {
      id: 'invoices',
      title: 'Purchase Invoices',
      icon: 'document-text-outline',
      description: 'Process supplier invoices',
    },
    {
      id: 'suppliers',
      title: 'Supplier Management',
      icon: 'business-outline',
      description: 'Manage supplier information',
    },
  ];

  const PurchaseOption = ({ item }) => (
    <TouchableOpacity
      style={[styles.optionCard, { backgroundColor: theme.colors.surface }]}
      activeOpacity={0.7}
    >
      <View style={[styles.optionIcon, { backgroundColor: '#7c3aed15' }]}>
        <Ionicons name={item.icon} size={28} color="#7c3aed" />
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
            <Text style={styles.headerTitle}>Purchases</Text>
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Purchase Management
        </Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          Manage your purchasing processes from orders to receipts
        </Text>

        <View style={styles.optionsContainer}>
          {purchaseOptions.map((item) => (
            <PurchaseOption key={item.id} item={item} />
          ))}
        </View>

        <View style={styles.comingSoonNote}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.warning} />
          <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
            Purchase module features are coming soon
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

export default PurchasesMenuScreen;