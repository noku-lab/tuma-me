import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';

export default function QRScanScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { transactionId } = route.params;
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);

    try {
      // Parse QR code data - optimized for fast processing
      let qrData = data;
      try {
        qrData = JSON.parse(data);
      } catch (e) {
        // If not JSON, treat as plain string
      }

      // Confirm delivery - optimized API call
      const startTime = Date.now();
      const response = await api.post(`/transactions/${transactionId}/confirm-delivery`, {
        qrCode: typeof qrData === 'string' ? qrData : JSON.stringify(qrData),
      });
      const endTime = Date.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(2);

      // Trigger vibration feedback for success
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Success',
        `Delivery confirmed in ${processingTime}s! Funds are on 12hr hold and will be released automatically.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to confirm delivery');
      setScanned(false);
    } finally {
      setProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <Button
          mode="contained"
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        >
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ['qr'],
        }}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          <View style={styles.scanFrame} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.instruction}>
            {processing
              ? 'Processing...'
              : scanned
              ? 'Scan successful!'
              : 'Position the QR code within the frame'}
          </Text>
          {scanned && !processing && (
            <Button
              mode="contained"
              onPress={() => setScanned(false)}
              style={styles.button}
            >
              Scan Again
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#6200ee',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  footer: {
    padding: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
  },
  instruction: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
});

