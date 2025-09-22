
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import Button from './Button';
import { AttendanceRecord, TimeCorrection } from '../types/attendance';

interface TimeCorrectionModalProps {
  visible: boolean;
  onClose: () => void;
  record: AttendanceRecord;
  field: 'checkInTime' | 'checkOutTime';
  onSave: (recordId: string, field: 'checkInTime' | 'checkOutTime', newTime: Date) => void;
}

const TIME_CORRECTIONS: TimeCorrection[] = [
  { type: 'full-hour', label: 'Volle Stunde', minutes: 0 },
  { type: 'quarter-past', label: 'Viertel nach', minutes: 15 },
  { type: 'half-hour', label: 'Halb', minutes: 30 },
  { type: 'quarter-to', label: 'Viertel vor', minutes: 45 },
];

export default function TimeCorrectionModal({
  visible,
  onClose,
  record,
  field,
  onSave,
}: TimeCorrectionModalProps) {
  const [selectedCorrection, setSelectedCorrection] = useState<TimeCorrection | null>(null);

  const currentTime = field === 'checkInTime' ? record.checkInTime : record.checkOutTime;
  
  if (!currentTime) {
    return null;
  }

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

  const calculateCorrectedTime = (correction: TimeCorrection): Date => {
    const correctedTime = new Date(currentTime);
    correctedTime.setMinutes(correction.minutes);
    correctedTime.setSeconds(0);
    correctedTime.setMilliseconds(0);
    return correctedTime;
  };

  const handleSave = () => {
    if (!selectedCorrection) {
      Alert.alert('Fehler', 'Bitte wählen Sie eine Korrektur aus.');
      return;
    }

    const correctedTime = calculateCorrectedTime(selectedCorrection);
    
    Alert.alert(
      'Zeit korrigieren',
      `Möchten Sie die ${field === 'checkInTime' ? 'Check-in' : 'Check-out'}-Zeit von ${formatTime(currentTime)} auf ${formatTime(correctedTime)} ändern?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Bestätigen',
          onPress: () => {
            onSave(record.id, field, correctedTime);
            onClose();
            setSelectedCorrection(null);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Zeit korrigieren</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{record.studentName}</Text>
              <Text style={styles.currentTime}>
                Aktuelle Zeit: {formatTime(currentTime)} ({formatDate(currentTime)})
              </Text>
              <Text style={styles.fieldLabel}>
                {field === 'checkInTime' ? 'Check-in Zeit' : 'Check-out Zeit'}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Korrektur auswählen:</Text>
            
            {TIME_CORRECTIONS.map((correction) => {
              const correctedTime = calculateCorrectedTime(correction);
              const isSelected = selectedCorrection?.type === correction.type;
              
              return (
                <TouchableOpacity
                  key={correction.type}
                  style={[
                    styles.correctionOption,
                    isSelected && styles.correctionOptionSelected,
                  ]}
                  onPress={() => setSelectedCorrection(correction)}
                >
                  <View style={styles.correctionInfo}>
                    <Text style={[
                      styles.correctionLabel,
                      isSelected && styles.correctionLabelSelected,
                    ]}>
                      {correction.label}
                    </Text>
                    <Text style={[
                      styles.correctionTime,
                      isSelected && styles.correctionTimeSelected,
                    ]}>
                      {formatTime(correctedTime)}
                    </Text>
                  </View>
                  {isSelected && (
                    <Icon name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Button
              text="Abbrechen"
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
              textStyle={styles.cancelButtonText}
            />
            <Button
              text="Speichern"
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
              textStyle={styles.saveButtonText}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  studentInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  currentTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  correctionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  correctionOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundAlt,
  },
  correctionInfo: {
    flex: 1,
  },
  correctionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  correctionLabelSelected: {
    color: colors.primary,
  },
  correctionTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  correctionTimeSelected: {
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
  },
  cancelButton: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.background,
  },
});
