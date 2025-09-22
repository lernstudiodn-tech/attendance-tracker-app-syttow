
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttendanceRecord } from '../types/attendance';

const ATTENDANCE_STORAGE_KEY = 'attendance_records';

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  const loadAttendanceRecords = async () => {
    try {
      const stored = await AsyncStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (stored) {
        const records = JSON.parse(stored).map((record: any) => ({
          ...record,
          checkInTime: new Date(record.checkInTime),
          checkOutTime: record.checkOutTime ? new Date(record.checkOutTime) : undefined,
          // Ensure backward compatibility with old records
          firstName: record.firstName || record.studentName?.split(' ')[0] || 'Unbekannt',
          lastName: record.lastName || record.studentName?.split(' ').slice(1).join(' ') || 'Unbekannt',
        }));
        setAttendanceRecords(records);
      }
    } catch (error) {
      console.log('Error loading attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAttendanceRecords = async (records: AttendanceRecord[]) => {
    try {
      await AsyncStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
      setAttendanceRecords(records);
    } catch (error) {
      console.log('Error saving attendance records:', error);
    }
  };

  const checkIn = async (studentId: string, firstName: string, lastName: string, location: string) => {
    const studentName = `${firstName} ${lastName}`;
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      studentId,
      studentName,
      firstName,
      lastName,
      checkInTime: new Date(),
      location,
      status: 'checked-in',
    };

    const updatedRecords = [...attendanceRecords, newRecord];
    await saveAttendanceRecords(updatedRecords);
    return newRecord;
  };

  const checkOut = async (studentId: string) => {
    const recordIndex = attendanceRecords.findIndex(
      record => record.studentId === studentId && record.status === 'checked-in'
    );

    if (recordIndex === -1) {
      throw new Error('Kein aktiver Check-in für diesen Schüler gefunden');
    }

    const updatedRecords = [...attendanceRecords];
    updatedRecords[recordIndex] = {
      ...updatedRecords[recordIndex],
      checkOutTime: new Date(),
      status: 'checked-out',
    };

    await saveAttendanceRecords(updatedRecords);
    return updatedRecords[recordIndex];
  };

  const updateAttendanceTime = async (recordId: string, field: 'checkInTime' | 'checkOutTime', newTime: Date) => {
    const recordIndex = attendanceRecords.findIndex(record => record.id === recordId);
    
    if (recordIndex === -1) {
      throw new Error('Anwesenheitseintrag nicht gefunden');
    }

    const updatedRecords = [...attendanceRecords];
    updatedRecords[recordIndex] = {
      ...updatedRecords[recordIndex],
      [field]: newTime,
    };

    await saveAttendanceRecords(updatedRecords);
    return updatedRecords[recordIndex];
  };

  const deleteAttendanceRecord = async (recordId: string) => {
    const updatedRecords = attendanceRecords.filter(record => record.id !== recordId);
    await saveAttendanceRecords(updatedRecords);
    return true;
  };

  const getActiveCheckIns = () => {
    return attendanceRecords.filter(record => record.status === 'checked-in');
  };

  const getTodaysRecords = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return attendanceRecords.filter(record => {
      const checkInDate = new Date(record.checkInTime);
      return checkInDate >= today && checkInDate < tomorrow;
    });
  };

  return {
    attendanceRecords,
    loading,
    checkIn,
    checkOut,
    updateAttendanceTime,
    deleteAttendanceRecord,
    getActiveCheckIns,
    getTodaysRecords,
    loadAttendanceRecords,
  };
};
