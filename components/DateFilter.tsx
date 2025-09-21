
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface DateFilterProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateFilter({ selectedDate, onDateChange }: DateFilterProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      onDateChange(date);
    }
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  return (
    <View style={styles.container}>
      <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 8 }]}>
        Datum:
      </Text>
      
      <View style={styles.dateControls}>
        <TouchableOpacity style={styles.dateButton} onPress={goToPreviousDay}>
          <Icon name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dateDisplay} 
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="calendar" size={16} color={colors.primary} />
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateButton} onPress={goToNextDay}>
          <Icon name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {!isToday() && (
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Heute</Text>
        </TouchableOpacity>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dateControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    minWidth: 180,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  todayButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  todayButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '500',
  },
});
