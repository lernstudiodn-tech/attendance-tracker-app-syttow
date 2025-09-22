
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../styles/commonStyles';
import { useTimetable } from '../hooks/useTimetable';
import { TimeSlot } from '../types/timetable';
import TimeSlotCard from '../components/TimeSlotCard';
import TimeSlotModal from '../components/TimeSlotModal';
import Button from '../components/Button';
import Icon from '../components/Icon';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  daySelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  selectedDayText: {
    color: colors.background,
  },
  content: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    padding: 20,
    paddingBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    margin: 16,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
});

const DAYS = [
  { key: 1, short: 'Mo', full: 'Montag' },
  { key: 2, short: 'Di', full: 'Dienstag' },
  { key: 3, short: 'Mi', full: 'Mittwoch' },
  { key: 4, short: 'Do', full: 'Donnerstag' },
  { key: 5, short: 'Fr', full: 'Freitag' },
  { key: 6, short: 'Sa', full: 'Samstag' },
  { key: 0, short: 'So', full: 'Sonntag' },
];

const TimetableScreen: React.FC = () => {
  const {
    timeSlots,
    students,
    loading,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    getTimeSlotsForDay,
    getDayName,
  } = useTimetable();

  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | undefined>();

  const currentDaySlots = getTimeSlotsForDay(selectedDay);

  const handleAddTimeSlot = () => {
    setEditingTimeSlot(undefined);
    setModalVisible(true);
  };

  const handleEditTimeSlot = (timeSlot: TimeSlot) => {
    setEditingTimeSlot(timeSlot);
    setModalVisible(true);
  };

  const handleDeleteTimeSlot = (id: string) => {
    Alert.alert(
      'Zeitslot löschen',
      'Möchten Sie diesen Zeitslot wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => deleteTimeSlot(id),
        },
      ]
    );
  };

  const handleSaveTimeSlot = async (timeSlotData: Omit<TimeSlot, 'id'>) => {
    try {
      if (editingTimeSlot) {
        await updateTimeSlot(editingTimeSlot.id, timeSlotData);
      } else {
        await addTimeSlot(timeSlotData);
      }
    } catch (error) {
      console.error('Error saving time slot:', error);
      Alert.alert('Fehler', 'Zeitslot konnte nicht gespeichert werden.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="time-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.loadingText}>Stundenplan wird geladen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stundenplan</Text>
        <Text style={styles.subtitle}>
          Verwalten Sie die Zeiten Ihrer Schüler
        </Text>
      </View>

      <View style={styles.daySelector}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day.key}
            style={[
              styles.dayButton,
              selectedDay === day.key && styles.selectedDay,
            ]}
            onPress={() => setSelectedDay(day.key)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDay === day.key && styles.selectedDayText,
              ]}
            >
              {day.short}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.dayTitle}>
          {getDayName(selectedDay)}
        </Text>

        {currentDaySlots.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="calendar-outline"
              size={64}
              color={colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>Keine Termine</Text>
            <Text style={styles.emptyText}>
              Fügen Sie Zeitslots für {getDayName(selectedDay)} hinzu, um zu sehen, wann Ihre Schüler kommen sollen.
            </Text>
            <Button
              text="Ersten Zeitslot hinzufügen"
              onPress={handleAddTimeSlot}
            />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {currentDaySlots.map((timeSlot) => (
              <TimeSlotCard
                key={timeSlot.id}
                timeSlot={timeSlot}
                onEdit={handleEditTimeSlot}
                onDelete={handleDeleteTimeSlot}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <Button
        text="Neuer Zeitslot"
        onPress={handleAddTimeSlot}
        style={styles.addButton}
      />

      <TimeSlotModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTimeSlot}
        students={students}
        dayOfWeek={selectedDay}
        editingTimeSlot={editingTimeSlot}
      />
    </SafeAreaView>
  );
};

export default TimetableScreen;
