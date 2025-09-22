
export interface TimeSlot {
  id: string;
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  studentId?: string;
  studentName?: string;
  subject?: string;
  location?: string;
}

export interface Student {
  id: string;
  name: string;
}

export interface TimetableDay {
  dayOfWeek: number;
  dayName: string;
  timeSlots: TimeSlot[];
}
