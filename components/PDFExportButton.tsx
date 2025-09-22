
import React, { useState } from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors, commonStyles } from '../styles/commonStyles';
import { AttendanceRecord } from '../types/attendance';
import Icon from './Icon';

interface PDFExportButtonProps {
  studentId: string;
  studentName: string;
  records: AttendanceRecord[];
  selectedDate?: Date;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default function PDFExportButton({ 
  studentId, 
  studentName, 
  records, 
  selectedDate 
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (checkIn: Date, checkOut?: Date) => {
    if (!checkOut) return 'Noch aktiv';
    
    const duration = checkOut.getTime() - checkIn.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const generateHTML = () => {
    const dateFilter = selectedDate ? formatDate(selectedDate) : 'Alle Daten';
    const totalHours = records.reduce((sum, record) => {
      if (record.checkOutTime) {
        const duration = record.checkOutTime.getTime() - record.checkInTime.getTime();
        return sum + (duration / (1000 * 60 * 60));
      }
      return sum;
    }, 0);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Stundenübersicht - ${studentName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #007AFF;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #007AFF;
              margin: 0;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .summary {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .summary h3 {
              margin-top: 0;
              color: #007AFF;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #007AFF;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .status-active {
              color: #28a745;
              font-weight: bold;
            }
            .status-completed {
              color: #007AFF;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Stundenübersicht</h1>
            <p><strong>Schüler:</strong> ${studentName}</p>
            <p><strong>Zeitraum:</strong> ${dateFilter}</p>
            <p><strong>Erstellt am:</strong> ${formatDate(new Date())} um ${formatTime(new Date())}</p>
          </div>

          <div class="summary">
            <h3>Zusammenfassung</h3>
            <p><strong>Anzahl Einträge:</strong> ${records.length}</p>
            <p><strong>Gesamtstunden:</strong> ${totalHours.toFixed(2)} Stunden</p>
            <p><strong>Aktive Sessions:</strong> ${records.filter(r => r.status === 'checked-in').length}</p>
            <p><strong>Abgeschlossene Sessions:</strong> ${records.filter(r => r.status === 'checked-out').length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Dauer</th>
                <th>Ort</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(record => `
                <tr>
                  <td>${formatDate(record.checkInTime)}</td>
                  <td>${formatTime(record.checkInTime)}</td>
                  <td>${record.checkOutTime ? formatTime(record.checkOutTime) : '-'}</td>
                  <td>${calculateDuration(record.checkInTime, record.checkOutTime)}</td>
                  <td>${record.location}</td>
                  <td class="status-${record.status === 'checked-in' ? 'active' : 'completed'}">
                    ${record.status === 'checked-in' ? 'Aktiv' : 'Abgeschlossen'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generiert von der Anwesenheits-App</p>
          </div>
        </body>
      </html>
    `;
  };

  const exportToPDF = async () => {
    if (records.length === 0) {
      Alert.alert('Keine Daten', 'Keine Anwesenheitsdaten für diesen Schüler gefunden.');
      return;
    }

    setIsExporting(true);
    
    try {
      console.log('Generating PDF for student:', studentName);
      
      const html = generateHTML();
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      console.log('PDF generated at:', uri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Stundenübersicht - ${studentName}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Erfolg', 'PDF wurde erstellt, aber Teilen ist auf diesem Gerät nicht verfügbar.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Fehler', 'PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={exportToPDF}
      disabled={isExporting}
    >
      <Icon 
        name={isExporting ? "hourglass" : "document-text"} 
        size={14} 
        color={colors.background} 
      />
      <Text style={styles.buttonText}>
        {isExporting ? 'Erstelle...' : 'PDF'}
      </Text>
    </TouchableOpacity>
  );
}
