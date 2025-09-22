
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TimeSlot } from '../types/timetable';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (id: string) => void;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  studentInfo: {
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subject: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptySlot: {
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ timeSlot, onEdit, onDelete }) => {
  const isEmpty = !timeSlot.studentId;

  return (
    <View style={[styles.card, isEmpty && styles.emptySlot]}>
      <View style={styles.header}>
        <Text style={styles.timeText}>
          {timeSlot.startTime} - {timeSlot.endTime}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(timeSlot)}
          >
            <Icon name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(timeSlot.id)}
          >
            <Icon name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {isEmpty ? (
        <Text style={styles.emptyText}>Kein Schüler zugewiesen</Text>
      ) : (
        <>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{timeSlot.studentName}</Text>
          </View>
          <View style={styles.details}>
            {timeSlot.subject && (
              <Text style={styles.subject}>{timeSlot.subject}</Text>
            )}
            {timeSlot.location && (
              <Text style={styles.location}>{timeSlot.location}</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
};

export default TimeSlotCard;
