
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { colors, commonStyles } from '../styles/commonStyles';

interface StudentOverviewChartProps {
  totalStudents: number;
  activeStudents: number;
  completedSessions: number;
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    ...commonStyles.card,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default function StudentOverviewChart({ 
  totalStudents, 
  activeStudents, 
  completedSessions 
}: StudentOverviewChartProps) {
  const inactiveStudents = totalStudents - activeStudents;

  const data = [
    {
      name: 'Aktiv',
      population: activeStudents,
      color: colors.success,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Abgeschlossen',
      population: completedSessions,
      color: colors.primary,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Inaktiv',
      population: inactiveStudents > 0 ? inactiveStudents : 0,
      color: colors.textSecondary,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ].filter(item => item.population > 0);

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  if (totalStudents === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Schüler-Übersicht</Text>
        <Text style={commonStyles.textSecondary}>
          Keine Schülerdaten verfügbar
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schüler-Übersicht</Text>
      
      <PieChart
        data={data}
        width={screenWidth - 80}
        height={200}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 0]}
        hasLegend={false}
      />

      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.name}: {item.population}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[commonStyles.textSecondary, { marginTop: 8, fontSize: 12 }]}>
        Gesamt: {totalStudents} Schüler
      </Text>
    </View>
  );
}
