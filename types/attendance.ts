
export interface AttendanceRecord {
  id: string;
  studentName: string;
  firstName: string;
  lastName: string;
  studentId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  location: string;
  status: 'checked-in' | 'checked-out';
}

export interface QRCodeData {
  studentId: string;
  firstName: string;
  lastName: string;
  location: string;
}

export interface TimeCorrection {
  type: 'full-hour' | 'quarter-past' | 'half-hour' | 'quarter-to';
  label: string;
  minutes: number;
}
