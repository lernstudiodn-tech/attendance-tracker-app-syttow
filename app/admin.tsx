
import React, { useState } from 'react';
import { Text, View, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendance } from '../hooks/useAttendance';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AttendanceCard from '../components/AttendanceCard';
import Icon from '../components/Icon';
import Button from '../components/Button';
import AdminStatsCard from '../components/AdminStatsCard';
import DateFilter from '../components/DateFilter';

export default function AdminScreen() {
  const { isAuthenticated, login, logout } = useAdminAuth();
  const { attendanceRecords, loading } = useAttendance();
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  const handleLogin = () => {
    if (login(password)) {
      setPassword('');
      Alert.alert('Erfolg', 'Administrator-Zugang gewährt');
    } else {
      Alert.alert('Fehler', 'Falsches Passwort');
      setPassword('');
    }
  };

  const handleLogout = () => {
    logout();
    Alert.alert('Abgemeldet', 'Sie wurden erfolgreich abgemeldet');
  };

  // Filter records based on selected date and student
  const getFilteredRecords = () => {
    let filtered = attendanceRecords;

    // Filter by date
    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      filtered = filtered.filter(record => {
        const checkInDate = new Date(record.checkInTime);
        return checkInDate >= startOfDay && checkInDate <= endOfDay;
      });
    }

    // Filter by student
    if (selectedStudent !== 'all') {
      filtered = filtered.filter(record => record.studentId === selectedStudent);
    }

    return filtered.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  };

  // Get unique students for filter
  const getUniqueStudents = () => {
    const students = attendanceRecords.reduce((acc, record) => {
      if (!acc.find(s => s.id === record.studentId)) {
        acc.push({
          id: record.studentId,
          name: record.studentName
        });
      }
      return acc;
    }, [] as { id: string; name: string }[]);
    
    return students.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Calculate statistics
  const getStatistics = () => {
    const filteredRecords = getFilteredRecords();
    const totalRecords = filteredRecords.length;
    const activeCheckIns = filteredRecords.filter(r => r.status === 'checked-in').length;
    const completedSessions = filteredRecords.filter(r => r.status === 'checked-out').length;
    
    // Calculate average session duration
    const completedWithDuration = filteredRecords.filter(r => r.checkOutTime);
    const totalDuration = completedWithDuration.reduce((sum, record) => {
      if (record.checkOutTime) {
        return sum + (record.checkOutTime.getTime() - record.checkInTime.getTime());
      }
      return sum;
    }, 0);
    
    const averageDuration = completedWithDuration.length > 0 
      ? totalDuration / completedWithDuration.length 
      : 0;

    return {
      totalRecords,
      activeCheckIns,
      completedSessions,
      averageDuration: Math.round(averageDuration / (1000 * 60)) // in minutes
    };
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.content}>
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Icon name="shield-checkmark" size={64} color={colors.primary} />
            <Text style={[commonStyles.title, { marginTop: 20 }]}>
              Administrator-Zugang
            </Text>
            <Text style={commonStyles.textSecondary}>
              Bitte geben Sie das Administrator-Passwort ein
            </Text>
          </View>

          <View style={{ width: '100%', maxWidth: 300 }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 20,
                backgroundColor: colors.card,
                color: colors.text,
              }}
              placeholder="Passwort eingeben"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              autoFocus
            />
            
            <Button
              text="Anmelden"
              onPress={handleLogin}
              style={[buttonStyles.primary, { marginBottom: 10 }]}
              textStyle={{ color: colors.background }}
            />
          </View>

          <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 20 }]}>
            Standard-Passwort: admin123
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.content}>
          <Text style={commonStyles.text}>Lade Anwesenheitsdaten...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredRecords = getFilteredRecords();
  const statistics = getStatistics();
  const uniqueStudents = getUniqueStudents();

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={commonStyles.title}>Admin Dashboard</Text>
            <Text style={commonStyles.textSecondary}>
              Anwesenheits-Übersicht
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={{ padding: 8 }}>
            <Icon name="log-out" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <AdminStatsCard statistics={statistics} />
        </View>

        {/* Filters */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>
            Filter
          </Text>
          
          <DateFilter
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* Student Filter */}
          <View style={{ marginTop: 16 }}>
            <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 8 }]}>
              Schüler:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: selectedStudent === 'all' ? colors.primary : colors.backgroundAlt,
                  marginRight: 8,
                }}
                onPress={() => setSelectedStudent('all')}
              >
                <Text style={{
                  color: selectedStudent === 'all' ? colors.background : colors.text,
                  fontSize: 14,
                  fontWeight: '500'
                }}>
                  Alle Schüler
                </Text>
              </TouchableOpacity>
              
              {uniqueStudents.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: selectedStudent === student.id ? colors.primary : colors.backgroundAlt,
                    marginRight: 8,
                  }}
                  onPress={() => setSelectedStudent(student.id)}
                >
                  <Text style={{
                    color: selectedStudent === student.id ? colors.background : colors.text,
                    fontSize: 14,
                    fontWeight: '500'
                  }}>
                    {student.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Records List */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={[commonStyles.subtitle, { textAlign: 'left', marginBottom: 16 }]}>
            Anwesenheitseinträge ({filteredRecords.length})
          </Text>
          
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <AttendanceCard key={record.id} record={record} showDuration />
            ))
          ) : (
            <View style={commonStyles.card}>
              <Text style={commonStyles.textSecondary}>
                Keine Einträge für die ausgewählten Filter gefunden
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
