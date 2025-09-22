
import React, { useState } from 'react';
import { Text, View, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendance } from '../hooks/useAttendance';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AttendanceCard from '../components/AttendanceCard';
import PDFExportButton from '../components/PDFExportButton';
import StudentOverviewChart from '../components/StudentOverviewChart';
import DateFilter from '../components/DateFilter';
import Button from '../components/Button';
import Icon from '../components/Icon';
import AdminStatsCard from '../components/AdminStatsCard';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

export default function AdminScreen() {
  const { attendanceRecords, updateAttendanceTime, deleteAttendanceRecord } = useAttendance();
  const { isAuthenticated, login, logout } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleLogin = async () => {
    try {
      await login(password);
      setPassword('');
    } catch (error) {
      Alert.alert('Fehler', 'Falsches Passwort');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleTimeCorrection = async (recordId: string, field: 'checkInTime' | 'checkOutTime', newTime: Date) => {
    try {
      await updateAttendanceTime(recordId, field, newTime);
      Alert.alert('Erfolg', 'Zeit wurde erfolgreich korrigiert');
    } catch (error) {
      Alert.alert('Fehler', 'Zeit konnte nicht korrigiert werden');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await deleteAttendanceRecord(recordId);
      Alert.alert('Erfolg', 'Anwesenheitseintrag wurde gelöscht');
    } catch (error) {
      Alert.alert('Fehler', 'Eintrag konnte nicht gelöscht werden');
    }
  };

  const getFilteredRecords = () => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.checkInTime);
      return recordDate >= startOfDay && recordDate <= endOfDay;
    });
  };

  const getUniqueStudents = () => {
    const students = new Set();
    attendanceRecords.forEach(record => {
      students.add(record.studentId);
    });
    return students.size;
  };

  const getStatistics = () => {
    const filteredRecords = getFilteredRecords();
    const activeCheckIns = filteredRecords.filter(record => record.status === 'checked-in').length;
    const completedSessions = filteredRecords.filter(record => record.status === 'checked-out').length;
    
    // Calculate average duration for completed sessions
    const completedRecords = filteredRecords.filter(record => record.checkOutTime);
    const totalDuration = completedRecords.reduce((sum, record) => {
      if (record.checkOutTime) {
        return sum + (record.checkOutTime.getTime() - record.checkInTime.getTime());
      }
      return sum;
    }, 0);
    
    const averageDuration = completedRecords.length > 0 
      ? Math.round(totalDuration / completedRecords.length / (1000 * 60)) 
      : 0;

    return {
      totalRecords: filteredRecords.length,
      activeCheckIns,
      completedSessions,
      averageDuration,
    };
  };

  const getChartData = () => {
    const totalStudents = getUniqueStudents();
    const statistics = getStatistics();
    
    return {
      totalStudents,
      activeStudents: statistics.activeCheckIns,
      completedSessions: statistics.completedSessions,
    };
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.content}>
          <View style={commonStyles.header}>
            <Text style={commonStyles.title}>Administrator</Text>
            <Text style={commonStyles.subtitle}>
              Bitte geben Sie das Administrator-Passwort ein
            </Text>
          </View>

          <View style={{ marginTop: 40 }}>
            <TextInput
              style={[commonStyles.input, { marginBottom: 20 }]}
              placeholder="Passwort"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onSubmitEditing={handleLogin}
            />
            
            <Button
              text="Anmelden"
              onPress={handleLogin}
              style={buttonStyles.primary}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const filteredRecords = getFilteredRecords();
  const statistics = getStatistics();
  const chartData = getChartData();

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <View style={{ flex: 1 }}>
          <Text style={commonStyles.title}>Admin Dashboard</Text>
          <Text style={commonStyles.subtitle}>
            Anwesenheitsverwaltung
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={{ padding: 8 }}>
          <Icon name="log-out-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <DateFilter
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <AdminStatsCard statistics={statistics} />

        <StudentOverviewChart
          totalStudents={chartData.totalStudents}
          activeStudents={chartData.activeStudents}
          completedSessions={chartData.completedSessions}
        />

        <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[commonStyles.sectionTitle, { margin: 0 }]}>
              Anwesenheitsliste ({filteredRecords.length})
            </Text>
          </View>

          {filteredRecords.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', padding: 40 }]}>
              <Icon name="calendar-outline" size={48} color={colors.textSecondary} />
              <Text style={[commonStyles.subtitle, { marginTop: 16, textAlign: 'center' }]}>
                Keine Anwesenheitseinträge für dieses Datum
              </Text>
            </View>
          ) : (
            <View style={{ gap: 0 }}>
              {filteredRecords.map((record) => (
                <View key={record.id} style={{ marginBottom: 8 }}>
                  <AttendanceCard
                    record={record}
                    showDuration={true}
                    isAdminMode={true}
                    onTimeCorrection={handleTimeCorrection}
                    onDelete={handleDeleteRecord}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, marginHorizontal: 20 }}>
                    <PDFExportButton
                      studentId={record.studentId}
                      studentName={record.studentName}
                      records={attendanceRecords.filter(r => r.studentId === record.studentId)}
                      selectedDate={selectedDate}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
