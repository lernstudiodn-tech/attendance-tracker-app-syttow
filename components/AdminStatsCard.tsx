
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface AdminStatsCardProps {
  statistics: {
    totalRecords: number;
    activeCheckIns: number;
    completedSessions: number;
    averageDuration: number;
  };
}

export default function AdminStatsCard({ statistics }: AdminStatsCardProps) {
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} Min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>
        Statistiken
      </Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Icon name="list" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{statistics.totalRecords}</Text>
          </View>
          <Text style={styles.statLabel}>Gesamt Einträge</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Icon name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.statValue}>{statistics.activeCheckIns}</Text>
          </View>
          <Text style={styles.statLabel}>Aktiv eingecheckt</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Icon name="checkmark-done" size={20} color={colors.warning} />
            <Text style={styles.statValue}>{statistics.completedSessions}</Text>
          </View>
          <Text style={styles.statLabel}>Abgeschlossen</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Icon name="time" size={20} color={colors.secondary} />
            <Text style={styles.statValue}>
              {statistics.averageDuration > 0 ? formatDuration(statistics.averageDuration) : '-'}
            </Text>
          </View>
          <Text style={styles.statLabel}>Ø Dauer</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
