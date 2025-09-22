
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { AttendanceRecord } from '../types/attendance';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import TimeCorrectionModal from './TimeCorrectionModal';

interface AttendanceCardProps {
  record: AttendanceRecord;
  showDuration?: boolean;
  isAdminMode?: boolean;
  onTimeCorrection?: (recordId: string, field: 'checkInTime' | 'checkOutTime', newTime: Date) => void;
  onDelete?: (recordId: string) => void;
}

export default function AttendanceCard({ 
  record, 
  showDuration = false, 
  isAdminMode = false,
  onTimeCorrection,
  onDelete
}: AttendanceCardProps) {
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionField, setCorrectionField] = useState<'checkInTime' | 'checkOutTime'>('checkInTime');
  
  const translateX = useRef(new Animated.Value(0)).current;
  const [isSwipeActive, setIsSwipeActive] = useState(false);

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

  const calculateDuration = (): string => {
    if (!record.checkOutTime) {
      // Calculate current duration for active check-ins
      const now = new Date();
      const duration = now.getTime() - record.checkInTime.getTime();
      const minutes = Math.floor(duration / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (hours > 0) {
        return `${hours}h ${remainingMinutes}m (aktiv)`;
      }
      return `${minutes}m (aktiv)`;
    } else {
      // Calculate completed duration
      const duration = record.checkOutTime.getTime() - record.checkInTime.getTime();
      const minutes = Math.floor(duration / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${minutes}m`;
    }
  };

  const handleTimeCorrection = (field: 'checkInTime' | 'checkOutTime') => {
    setCorrectionField(field);
    setShowCorrectionModal(true);
  };

  const handleSaveCorrection = (recordId: string, field: 'checkInTime' | 'checkOutTime', newTime: Date) => {
    if (onTimeCorrection) {
      onTimeCorrection(recordId, field, newTime);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eintrag löschen',
      `Möchten Sie den Anwesenheitseintrag für ${record.studentName} wirklich löschen?`,
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
          onPress: () => {
            // Reset swipe position
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
            setIsSwipeActive(false);
          }
        },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(record.id);
            }
          }
        }
      ]
    );
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (!isAdminMode || !onDelete) return;

    if (event.nativeEvent.state === State.END) {
      const { translationX: translation, velocityX } = event.nativeEvent;
      
      // Determine if swipe should trigger delete action
      const shouldShowDelete = translation < -80 || velocityX < -500;
      
      if (shouldShowDelete) {
        Animated.spring(translateX, {
          toValue: -120,
          useNativeDriver: true,
        }).start();
        setIsSwipeActive(true);
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setIsSwipeActive(false);
      }
    }
  };

  const resetSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    setIsSwipeActive(false);
  };

  const cardContent = (
    <View style={[commonStyles.card, styles.card]}>
      <View style={styles.header}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{record.studentName}</Text>
          <View style={styles.nameDetails}>
            <Text style={styles.nameDetail}>Vorname: {record.firstName}</Text>
            <Text style={styles.nameDetail}>Nachname: {record.lastName}</Text>
          </View>
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
          <View style={styles.timeContainer}>
            <Text style={styles.detailText}>
              Check-in: {formatTime(record.checkInTime)} ({formatDate(record.checkInTime)})
            </Text>
            {isAdminMode && onTimeCorrection && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleTimeCorrection('checkInTime')}
              >
                <Icon name="create-outline" size={14} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {record.checkOutTime && (
          <View style={styles.detailRow}>
            <Icon name="exit-outline" size={16} color={colors.textSecondary} />
            <View style={styles.timeContainer}>
              <Text style={styles.detailText}>
                Check-out: {formatTime(record.checkOutTime)} ({formatDate(record.checkOutTime)})
              </Text>
              {isAdminMode && onTimeCorrection && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleTimeCorrection('checkOutTime')}
                >
                  <Icon name="create-outline" size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {showDuration && (
          <View style={styles.detailRow}>
            <Icon name="hourglass-outline" size={16} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.primary, fontWeight: '500' }]}>
              Dauer: {calculateDuration()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        {isAdminMode && onDelete ? (
          <>
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
              activeOffsetX={[-10, 10]}
            >
              <Animated.View
                style={[
                  styles.swipeContainer,
                  {
                    transform: [{ translateX }],
                  },
                ]}
              >
                {cardContent}
              </Animated.View>
            </PanGestureHandler>
            
            {/* Delete button that appears when swiped */}
            <View style={styles.deleteButtonContainer}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Icon name="trash-outline" size={24} color={colors.background} />
                <Text style={styles.deleteButtonText}>Löschen</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          cardContent
        )}
      </View>

      {isAdminMode && onTimeCorrection && (
        <TimeCorrectionModal
          visible={showCorrectionModal}
          onClose={() => setShowCorrectionModal(false)}
          record={record}
          field={correctionField}
          onSave={handleSaveCorrection}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
    position: 'relative',
  },
  swipeContainer: {
    zIndex: 1,
  },
  card: {
    margin: 0,
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
    marginBottom: 4,
  },
  nameDetails: {
    marginBottom: 4,
  },
  nameDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 1,
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
  timeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: colors.backgroundAlt,
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  deleteButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
