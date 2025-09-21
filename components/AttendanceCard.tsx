
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AttendanceRecord } from '../types/attendance';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface AttendanceCardProps {
  record: AttendanceRecord;
}

export default function AttendanceCard({ record }: AttendanceCardProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = () => {
    return record.status === 'checked-in' ? colors.success : colors.textSecondary;
  };

  const getStatusIcon = () => {
    return record.status === 'checked-in' ? 'checkmark-circle' : 'checkmark-circle-outline';
  };

  return (
    <View style={[commonStyles.card, styles.card]}>
      <View style={styles.header}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{record.studentName}</Text>
          <Text style={styles.studentId}>ID: {record.studentId}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Icon name={getStatusIcon()} size={16} color={colors.background} />
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{record.location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            Check-in: {formatTime(record.checkInTime)} ({formatDate(record.checkInTime)})
          </Text>
        </View>

        {record.checkOutTime && (
          <View style={styles.detailRow}>
            <Icon name="exit-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              Check-out: {formatTime(record.checkOutTime)} ({formatDate(record.checkOutTime)})
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  studentId: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
});
