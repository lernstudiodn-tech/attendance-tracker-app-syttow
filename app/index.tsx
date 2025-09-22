
import React, { useState } from 'react';
import { Text, View, ScrollView, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendance } from '../hooks/useAttendance';
import QRScanner from '../components/QRScanner';
import AttendanceCard from '../components/AttendanceCard';
import Button from '../components/Button';

export default function MainScreen() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<'checkin' | 'checkout'>('checkin');
  const { checkIn, checkOut, getActiveCheckIns, getTodaysRecords, loading } = useAttendance();

  const handleScan = async (data: string) => {
    try {
      console.log('Processing QR scan:', data);
      
      // Parse QR code data (expecting JSON format with firstName and lastName)
      let qrData;
      try {
        qrData = JSON.parse(data);
      } catch {
        // If not JSON, treat as simple student ID and ask for name
        Alert.alert(
          'QR-Code Format',
          'Der QR-Code enthält keine Namensinformationen. Bitte verwenden Sie einen QR-Code mit folgendem Format:\n\n{"studentId": "12345", "firstName": "Max", "lastName": "Mustermann", "location": "Klassenzimmer"}'
        );
        setShowScanner(false);
        return;
      }

      const { studentId, firstName, lastName, location } = qrData;

      // Validate required fields
      if (!studentId || !firstName || !lastName) {
        Alert.alert(
          'Unvollständige Daten',
          'Der QR-Code muss studentId, firstName und lastName enthalten.'
        );
        setShowScanner(false);
        return;
      }

      const studentName = `${firstName} ${lastName}`;

      if (scanMode === 'checkin') {
        // Check if student is already checked in
        const activeCheckIns = getActiveCheckIns();
        const existingCheckIn = activeCheckIns.find(record => record.studentId === studentId);
        
        if (existingCheckIn) {
          Alert.alert(
            'Bereits eingecheckt',
            `${studentName} ist bereits eingecheckt seit ${existingCheckIn.checkInTime.toLocaleTimeString('de-DE')}`
          );
        } else {
          await checkIn(studentId, firstName, lastName, location || 'Klassenzimmer');
          Alert.alert(
            'Check-in erfolgreich',
            `${studentName} wurde erfolgreich eingecheckt`
          );
        }
      } else {
        await checkOut(studentId);
        Alert.alert(
          'Check-out erfolgreich',
          `${studentName} wurde erfolgreich ausgecheckt`
        );
      }
    } catch (error) {
      console.log('Error processing scan:', error);
      Alert.alert(
        'Fehler',
        error instanceof Error ? error.message : 'Unbekannter Fehler beim Verarbeiten des QR-Codes'
      );
    } finally {
      setShowScanner(false);
    }
  };

  const handleCheckIn = () => {
    setScanMode('checkin');
    setShowScanner(true);
  };

  const handleCheckOut = () => {
    setScanMode('checkout');
    setShowScanner(true);
  };

  const activeCheckIns = getActiveCheckIns();
  const todaysRecords = getTodaysRecords();

  if (showScanner) {
    return (
      <QRScanner
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
        title={scanMode === 'checkin' ? 'Check-in Scanner' : 'Check-out Scanner'}
      />
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

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={commonStyles.title}>Anwesenheit</Text>
          <Text style={commonStyles.textSecondary}>
            Schüler Check-in & Check-out System
          </Text>
        </View>

        {/* QR Code Format Info */}
        <View style={[commonStyles.card, { marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.backgroundAlt }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            QR-Code Format:
          </Text>
          <Text style={[commonStyles.textSecondary, { fontSize: 12, fontFamily: 'monospace' }]}>
            {`{"studentId": "12345", "firstName": "Max", "lastName": "Mustermann", "location": "Klassenzimmer"}`}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={commonStyles.buttonContainer}>
          <Button
            text="Check-in (QR-Code scannen)"
            onPress={handleCheckIn}
            style={{
              backgroundColor: colors.success,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            textStyle={{ color: colors.background }}
          />
          
          <Button
            text="Check-out (QR-Code scannen)"
            onPress={handleCheckOut}
            style={{
              backgroundColor: colors.warning,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            textStyle={{ color: colors.background }}
          />
        </View>

        {/* Statistics */}
        <View style={[commonStyles.card, { marginHorizontal: 20, marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Heute</Text>
          <View style={commonStyles.row}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.success }}>
                {activeCheckIns.length}
              </Text>
              <Text style={commonStyles.textSecondary}>Aktiv eingecheckt</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
                {todaysRecords.length}
              </Text>
              <Text style={commonStyles.textSecondary}>Gesamt heute</Text>
            </View>
          </View>
        </View>

        {/* Active Check-ins */}
        {activeCheckIns.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.subtitle, { paddingHorizontal: 20, marginBottom: 12 }]}>
              Aktive Check-ins
            </Text>
            {activeCheckIns.map((record) => (
              <AttendanceCard key={record.id} record={record} />
            ))}
          </View>
        )}

        {/* Today's Records */}
        {todaysRecords.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.subtitle, { paddingHorizontal: 20, marginBottom: 12 }]}>
              Heutige Einträge
            </Text>
            {todaysRecords
              .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
              .map((record) => (
                <AttendanceCard key={record.id} record={record} />
              ))}
          </View>
        )}

        {todaysRecords.length === 0 && (
          <View style={[commonStyles.card, { marginHorizontal: 20 }]}>
            <Text style={commonStyles.textSecondary}>
              Noch keine Anwesenheitseinträge für heute
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
