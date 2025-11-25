// React Native Module Dropdown Component Example
// This shows how to integrate the module dropdown in your mobile app

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import nestjsApiService from '../services/nestjsApiService';

const ModuleDropdown = ({ selectedModule, onModuleSelect, placeholder = "Select Module" }) => {
  const [modules, setModules] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await nestjsApiService.getModules();
      
      if (response.success) {
        // Add "All Modules" option for filtering
        const allModulesOption = {
          id: 'all',
          name: 'all',
          displayName: 'All Modules',
          description: 'Show all approvals'
        };
        
        setModules([allModulesOption, ...response.data]);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = (module) => {
    onModuleSelect(module);
    setIsDropdownOpen(false);
  };

  const renderModuleItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        selectedModule?.id === item.id && styles.selectedItem
      ]}
      onPress={() => handleModuleSelect(item)}
    >
      <View style={styles.moduleInfo}>
        <Text style={styles.moduleName}>{item.displayName}</Text>
        {item.description && (
          <Text style={styles.moduleDescription}>{item.description}</Text>
        )}
      </View>
      {selectedModule?.id === item.id && (
        <Ionicons name="checkmark" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Module</Text>
      
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsDropdownOpen(true)}
      >
        <Text style={[styles.dropdownText, !selectedModule && styles.placeholder]}>
          {selectedModule ? selectedModule.displayName : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Module</Text>
              <TouchableOpacity onPress={() => setIsDropdownOpen(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={modules}
              keyExtractor={(item) => item.id}
              renderItem={renderModuleItem}
              style={styles.moduleList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    maxHeight: '70%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  moduleList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedItem: {
    backgroundColor: '#F0F8FF',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

// Usage Example in Approval Form:
/*
const ApprovalFormScreen = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    priority: 'MEDIUM',
    // ... other fields
  });

  const handleSubmit = async () => {
    try {
      const approvalData = {
        ...formData,
        moduleId: selectedModule?.id, // Include selected module
        itemType: 'expense',
        itemId: `approval_${Date.now()}`,
        requestedBy: user.email,
        // ... other required fields
      };

      const response = await nestjsApiService.post('/approvals', approvalData);
      
      if (response.success) {
        // Handle success - show success message, navigate back, etc.
        console.log('Approval created:', response.data);
      }
    } catch (error) {
      console.error('Error creating approval:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ModuleDropdown
        selectedModule={selectedModule}
        onModuleSelect={setSelectedModule}
        placeholder="Select relevant module"
      />
      
      // ... other form fields
      
      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={!selectedModule} // Require module selection
      >
        <Text style={styles.submitButtonText}>Create Approval</Text>
      </TouchableOpacity>
    </View>
  );
};
*/

// Usage Example for Filtering Approvals:
/*
const ApprovalsListScreen = () => {
  const [approvals, setApprovals] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);

  const fetchApprovals = async (moduleId = null) => {
    try {
      const endpoint = moduleId && moduleId !== 'all' 
        ? `/approvals/by-module/${moduleId}`
        : '/approvals';
        
      const response = await nestjsApiService.get(endpoint);
      
      if (response.success || response.data) {
        setApprovals(response.data || response);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const handleModuleFilter = (module) => {
    setSelectedModule(module);
    fetchApprovals(module?.id);
  };

  return (
    <View style={styles.container}>
      <ModuleDropdown
        selectedModule={selectedModule}
        onModuleSelect={handleModuleFilter}
        placeholder="Filter by module"
      />
      
      // ... approvals list component
    </View>
  );
};
*/

export default ModuleDropdown;