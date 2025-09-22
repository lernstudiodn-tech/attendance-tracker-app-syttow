
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { TimeSlot, Student } from '../types/timetable';
import { colors, commonStyles } from '../styles/commonStyles';
import Button from './Button';
import Icon from './Icon';

interface TimeSlotModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (timeSlot: Omit<TimeSlot, 'id'>) => void;
  students: Student[];
  dayOfWeek: number;
  editingTimeSlot?: TimeSlot;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  studentList: {
    maxHeight: 150,
  },
  studentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedStudent: {
    backgroundColor: colors.primaryLight,
  },
  studentText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  visible,
  onClose,
  onSave,
  students,
  dayOfWeek,
  editingTimeSlot,
}) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (editingTimeSlot) {
      setStartTime(editingTimeSlot.startTime);
      setEndTime(editingTimeSlot.endTime);
      setSelectedStudentId(editingTimeSlot.studentId || '');
      setSubject(editingTimeSlot.subject || '');
      setLocation(editingTimeSlot.location || '');
    } else {
      // Reset form for new time slot
      setStartTime('09:00');
      setEndTime('10:00');
      setSelectedStudentId('');
      setSubject('');
      setLocation('');
    }
  }, [editingTimeSlot, visible]);

  const handleSave = () => {
    if (!startTime || !endTime) {
      Alert.alert('Fehler', 'Bitte geben Sie Start- und Endzeit ein.');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Fehler', 'Die Startzeit muss vor der Endzeit liegen.');
      return;
    }

    const selectedStudent = students.find(s => s.id === selectedStudentId);

    const timeSlotData: Omit<TimeSlot, 'id'> = {
      startTime,
      endTime,
      dayOfWeek,
      studentId: selectedStudentId || undefined,
      studentName: selectedStudent?.name || undefined,
      subject: subject || undefined,
      location: location || undefined,
    };

    onSave(timeSlotData);
    onClose();
  };

  const formatTimeInput = (text: string) => {
    // Remove non-numeric characters
    const numbers = text.replace(/[^\d]/g, '');
    
    // Format as HH:MM
    if (numbers.length >= 3) {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
    } else if (numbers.length >= 1) {
      return numbers;
    }
    return '';
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingTimeSlot ? 'Zeitslot bearbeiten' : 'Neuer Zeitslot'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.label}>Zeit</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <TextInput
                    style={styles.input}
                    value={startTime}
                    onChangeText={(text) => setStartTime(formatTimeInput(text))}
                    placeholder="09:00"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={styles.timeInput}>
                  <TextInput
                    style={styles.input}
                    value={endTime}
                    onChangeText={(text) => setEndTime(formatTimeInput(text))}
                    placeholder="10:00"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Schüler auswählen</Text>
              <ScrollView style={styles.studentList} nestedScrollEnabled>
                <TouchableOpacity
                  style={[
                    styles.studentOption,
                    !selectedStudentId && styles.selectedStudent,
                  ]}
                  onPress={() => setSelectedStudentId('')}
                >
                  <Icon
                    name={!selectedStudentId ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.studentText}>Kein Schüler</Text>
                </TouchableOpacity>
                {students.map((student) => (
                  <TouchableOpacity
                    key={student.id}
                    style={[
                      styles.studentOption,
                      selectedStudentId === student.id && styles.selectedStudent,
                    ]}
                    onPress={() => setSelectedStudentId(student.id)}
                  >
                    <Icon
                      name={
                        selectedStudentId === student.id
                          ? 'radio-button-on'
                          : 'radio-button-off'
                      }
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.studentText}>{student.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Fach (optional)</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="z.B. Mathematik"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Ort (optional)</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="z.B. Raum 101"
              />
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <Button
              text="Abbrechen"
              onPress={onClose}
              style={[styles.button, { backgroundColor: colors.surface }]}
              textStyle={{ color: colors.text }}
            />
            <Button
              text={editingTimeSlot ? 'Speichern' : 'Hinzufügen'}
              onPress={handleSave}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TimeSlotModal;
