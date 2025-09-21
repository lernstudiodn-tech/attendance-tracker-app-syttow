
export interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  location: string;
  status: 'checked-in' | 'checked-out';
}

export interface QRCodeData {
  studentId: string;
  studentName: string;
  location: string;
}
