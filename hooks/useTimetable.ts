
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { TimeSlot, Student } from '../types/timetable';

const TIMETABLE_STORAGE_KEY = 'timetable_data';
const STUDENTS_STORAGE_KEY = 'students_data';

export const useTimetable = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [timetableData, studentsData] = await Promise.all([
        AsyncStorage.getItem(TIMETABLE_STORAGE_KEY),
        AsyncStorage.getItem(STUDENTS_STORAGE_KEY)
      ]);

      if (timetableData) {
        setTimeSlots(JSON.parse(timetableData));
      }

      if (studentsData) {
        setStudents(JSON.parse(studentsData));
      } else {
        // Initialize with some default students
        const defaultStudents: Student[] = [
          { id: '1', name: 'Max Mustermann' },
          { id: '2', name: 'Anna Schmidt' },
          { id: '3', name: 'Tom Weber' },
        ];
        setStudents(defaultStudents);
        await AsyncStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(defaultStudents));
      }
    } catch (error) {
      console.error('Error loading timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTimeSlots = async (newTimeSlots: TimeSlot[]) => {
    try {
      await AsyncStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(newTimeSlots));
      setTimeSlots(newTimeSlots);
    } catch (error) {
      console.error('Error saving timetable data:', error);
    }
  };

  const addTimeSlot = async (timeSlot: Omit<TimeSlot, 'id'>) => {
    const newTimeSlot: TimeSlot = {
      ...timeSlot,
      id: Date.now().toString(),
    };
    const updatedTimeSlots = [...timeSlots, newTimeSlot];
    await saveTimeSlots(updatedTimeSlots);
  };

  const updateTimeSlot = async (id: string, updates: Partial<TimeSlot>) => {
    const updatedTimeSlots = timeSlots.map(slot =>
      slot.id === id ? { ...slot, ...updates } : slot
    );
    await saveTimeSlots(updatedTimeSlots);
  };

  const deleteTimeSlot = async (id: string) => {
    const updatedTimeSlots = timeSlots.filter(slot => slot.id !== id);
    await saveTimeSlots(updatedTimeSlots);
  };

  const addStudent = async (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
    };
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    await AsyncStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updatedStudents));
  };

  const getTimeSlotsForDay = (dayOfWeek: number) => {
    return timeSlots
      .filter(slot => slot.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[dayOfWeek];
  };

  return {
    timeSlots,
    students,
    loading,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    addStudent,
    getTimeSlotsForDay,
    getDayName,
  };
};
