
import React, { useState } from 'react';
import { Text, View, Alert, Image } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendance } from '../hooks/useAttendance';
import QRScanner from '../components/QRScanner';
import Button from '../components/Button';

export default function MainScreen() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<'checkin' | 'checkout'>('checkin');
  const { checkIn, checkOut, getActiveCheckIns, loading } = useAttendance();

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
        <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={commonStyles.text}>Lade Anwesenheitsdaten...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 60 }}>
          <Image 
            source={require('../assets/images/natively-dark.png')} 
            style={{ 
              width: 120, 
              height: 120, 
              marginBottom: 20,
              borderRadius: 20
            }} 
            resizeMode="contain"
          />
          <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
            Anwesenheit
          </Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
            Schüler Check-in & Check-out System
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[commonStyles.buttonContainer, { width: '100%', maxWidth: 300 }]}>
          <Button
            text="Check-in"
            onPress={handleCheckIn}
            style={{
              backgroundColor: colors.success,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              borderRadius: 12,
            }}
            textStyle={{ 
              color: colors.background, 
              fontSize: 18, 
              fontWeight: '600' 
            }}
          />
          
          <Button
            text="Check-out"
            onPress={handleCheckOut}
            style={{
              backgroundColor: colors.error,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              borderRadius: 12,
            }}
            textStyle={{ 
              color: colors.background, 
              fontSize: 18, 
              fontWeight: '600' 
            }}
          />
        </View>

        {/* QR Code Format Info */}
        <View style={[commonStyles.card, { 
          marginTop: 40, 
          backgroundColor: colors.backgroundAlt, 
          maxWidth: 350,
          width: '100%'
        }]}>
          <Text style={[commonStyles.text, { 
            fontWeight: '600', 
            marginBottom: 8, 
            textAlign: 'left',
            fontSize: 14
          }]}>
            QR-Code Format:
          </Text>
          <Text style={[commonStyles.textSecondary, { 
            fontSize: 11, 
            fontFamily: 'monospace',
            textAlign: 'left',
            lineHeight: 16
          }]}>
            {`{"studentId": "12345", "firstName": "Max", "lastName": "Mustermann", "location": "Klassenzimmer"}`}
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}
