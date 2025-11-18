import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DatePicker = ({ 
  value, 
  onDateChange, 
  placeholder = "Select Date",
  style,
  minimumDate,
  maximumDate 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());

  // Generate calendar days
  const generateCalendar = () => {
    const today = new Date();
    const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const firstDayOfMonth = currentDate.getDay();
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const isDisabled = (minimumDate && date < minimumDate) || (maximumDate && date > maximumDate);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = value && date.toDateString() === new Date(value).toDateString();
      
      days.push({
        day,
        date,
        isDisabled,
        isToday,
        isSelected
      });
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    onDateChange(formattedDate);
    setShowPicker(false);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <TouchableOpacity
        style={[styles.dateInput, style]}
        onPress={() => setShowPicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#666" />
        <Text style={[styles.dateText, !value && styles.placeholderText]}>
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigateMonth(-1)}>
                <Ionicons name="chevron-back" size={24} color="#007bff" />
              </TouchableOpacity>
              
              <Text style={styles.monthYear}>
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </Text>
              
              <TouchableOpacity onPress={() => navigateMonth(1)}>
                <Ionicons name="chevron-forward" size={24} color="#007bff" />
              </TouchableOpacity>
            </View>

            {/* Day names */}
            <View style={styles.dayNamesRow}>
              {dayNames.map(day => (
                <Text key={day} style={styles.dayName}>{day}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendar}>
              {generateCalendar().map((dayData, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    dayData?.isToday && styles.todayCell,
                    dayData?.isSelected && styles.selectedCell,
                    dayData?.isDisabled && styles.disabledCell,
                  ]}
                  onPress={() => dayData && !dayData.isDisabled && handleDateSelect(dayData.date)}
                  disabled={!dayData || dayData.isDisabled}
                >
                  <Text
                    style={[
                      styles.dayText,
                      dayData?.isToday && styles.todayText,
                      dayData?.isSelected && styles.selectedText,
                      dayData?.isDisabled && styles.disabledText,
                    ]}
                  >
                    {dayData?.day || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.todayButton}
                onPress={() => {
                  const today = new Date();
                  if (!minimumDate || today >= minimumDate) {
                    if (!maximumDate || today <= maximumDate) {
                      handleDateSelect(today);
                    }
                  }
                }}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 10,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    paddingVertical: 5,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 1,
  },
  todayCell: {
    backgroundColor: '#e3f2fd',
  },
  selectedCell: {
    backgroundColor: '#007bff',
  },
  disabledCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  todayText: {
    color: '#007bff',
    fontWeight: '600',
  },
  selectedText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledText: {
    color: '#ccc',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  todayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  todayButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});

export default DatePicker;