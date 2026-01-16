import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, ActivityIndicator, Card } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import QRCode from 'react-native-qrcode-svg';

export default function QRPresentationScreen() {
  const route = useRoute();
  const { transactionId } = route.params;
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    loadQRCode();
    
    // Poll for scan status
    const pollInterval = setInterval(() => {
      checkScanStatus();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(pollInterval);
  }, [transactionId]);

  const loadQRCode = async () => {
    try {
      const response = await api.get(`/qr/${transactionId}`);
      setQrData({
        qrCodeString: response.data.qrCodeString,
        expiresAt: response.data.expiresAt,
        scanned: response.data.scanned
      });
      setScanned(response.data.scanned);
    } catch (error) {
      Alert.alert('Error', 'Failed to load QR code');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkScanStatus = async () => {
    try {
      const response = await api.get(`/qr/${transactionId}`);
      if (response.data.scanned && !scanned) {
        setScanned(true);
        // Trigger vibration feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success!', 'QR code has been scanned successfully by the retailer.');
      }
    } catch (error) {
      // Silently fail - don't show error for polling
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!qrData) {
    return (
      <View style={styles.center}>
        <Text>QR code not available</Text>
      </View>
    );
  }

  const isExpired = new Date(qrData.expiresAt) < new Date();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="titleLarge" style={styles.title}>
            Present QR Code to Retailer
          </Text>
          
          {scanned ? (
            <View style={styles.successContainer}>
              <Text variant="headlineMedium" style={styles.successText}>
                ✓ Scanned Successfully
              </Text>
              <Text variant="bodyMedium" style={styles.successMessage}>
                The retailer has confirmed delivery. Funds will be released in 12 hours.
              </Text>
            </View>
          ) : isExpired ? (
            <View style={styles.expiredContainer}>
              <Text variant="headlineMedium" style={styles.expiredText}>
                QR Code Expired
              </Text>
              <Text variant="bodyMedium" style={styles.expiredMessage}>
                This QR code has expired. Please generate a new one.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.qrContainer}>
                <Text variant="headlineMedium" style={styles.qrText}>
                  QR Code
                </Text>
                <Text variant="bodyLarge" style={styles.qrCodeString} selectable>
                  {qrData.qrCodeString}
                </Text>
                <Text variant="bodySmall" style={styles.qrHint}>
                  (QR image would be displayed here - use hardware device or generate image)
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.hint}>
                Show this QR code to the retailer to scan
              </Text>
              <Text variant="bodySmall" style={styles.expiry}>
                Expires: {new Date(qrData.expiresAt).toLocaleString()}
              </Text>
            </>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    elevation: 4,
    width: '90%',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  qrText: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  qrCodeString: {
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 8,
  },
  qrHint: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  expiry: {
    textAlign: 'center',
    color: '#999',
    marginTop: 8,
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
  },
  successText: {
    color: '#4caf50',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  successMessage: {
    textAlign: 'center',
    color: '#666',
  },
  expiredContainer: {
    alignItems: 'center',
    padding: 24,
  },
  expiredText: {
    color: '#f44336',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  expiredMessage: {
    textAlign: 'center',
    color: '#666',
  },
});

