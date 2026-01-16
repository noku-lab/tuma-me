import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Card, Text, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';

export default function TransactionDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      setTransaction(response.data);

      // If transaction has QR code and user is seller, load QR image
      if (response.data.qrCode?.code && response.data.status === 'in_transit') {
        loadQRCode();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load transaction details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadQRCode = async () => {
    try {
      const response = await api.get(`/qr/${transactionId}`);
      setQrCodeImage(response.data.qrCodeImage);
    } catch (error) {
      console.error('Error loading QR code:', error);
    }
  };

  const handleFund = async () => {
    setProcessing(true);
    try {
      await api.post(`/transactions/${transactionId}/fund`, {
        paymentIntentId: `PI-${Date.now()}`,
      });
      Alert.alert('Success', 'Transaction funded successfully');
      loadTransaction();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to fund transaction');
    } finally {
      setProcessing(false);
    }
  };

  const handleInitiateDelivery = async () => {
    setProcessing(true);
    try {
      const response = await api.post(`/transactions/${transactionId}/initiate-delivery`);
      setQrCodeImage(response.data.qrCodeImage);
      Alert.alert('Success', 'Delivery initiated. QR code generated.');
      loadTransaction();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to initiate delivery');
    } finally {
      setProcessing(false);
    }
  };

  const handleScanQR = () => {
    navigation.navigate('QRScan', { transactionId });
  };

  const handleFileDispute = async () => {
    if (!disputeReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for the dispute');
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/disputes/${transactionId}`, {
        reason: disputeReason
      });
      Alert.alert('Success', 'Dispute filed successfully. Funds are held until resolution.');
      setShowDisputeForm(false);
      setDisputeReason('');
      loadTransaction();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to file dispute');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      funded: '#2196f3',
      in_transit: '#9c27b0',
      delivered: '#8bc34a',
      on_hold: '#ff9800',
      completed: '#4caf50',
      cancelled: '#f44336',
      disputed: '#e91e63',
    };
    return colors[status] || '#757575';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.center}>
        <Text>Transaction not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.transactionId}>
              {transaction.transactionId}
            </Text>
            <Chip
              style={[styles.chip, { backgroundColor: getStatusColor(transaction.status) }]}
              textStyle={styles.chipText}
            >
              {transaction.status.replace('_', ' ').toUpperCase()}
            </Chip>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Amount
            </Text>
            <Text variant="headlineMedium" style={styles.amount}>
              ${transaction.amount.toFixed(2)} {transaction.currency}
            </Text>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Description
            </Text>
            <Text variant="bodyMedium">{transaction.description}</Text>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Parties
            </Text>
            <Text variant="bodyMedium">Retailer: {transaction.retailer?.name || 'N/A'}</Text>
            <Text variant="bodyMedium">Wholesaler: {transaction.wholesaler?.name || 'N/A'}</Text>
            {transaction.deliveryAgent && (
              <Text variant="bodyMedium">Delivery Agent: {transaction.deliveryAgent?.name || 'N/A'}</Text>
            )}
          </View>

          {transaction.deliveryAddress && (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Delivery Address
              </Text>
              <Text variant="bodyMedium">
                {transaction.deliveryAddress.street}
                {'\n'}
                {transaction.deliveryAddress.city}, {transaction.deliveryAddress.state}{' '}
                {transaction.deliveryAddress.zipCode}
                {'\n'}
                {transaction.deliveryAddress.country}
              </Text>
            </View>
          )}

          {qrCodeImage && (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Delivery QR Code
              </Text>
              <Image source={{ uri: qrCodeImage }} style={styles.qrCode} />
              <Text variant="bodySmall" style={styles.qrHint}>
                Show this QR code to the buyer for scanning
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            {transaction.status === 'pending' && (
              <Button
                mode="contained"
                onPress={handleFund}
                loading={processing}
                disabled={processing}
                style={styles.actionButton}
              >
                Fund Transaction
              </Button>
            )}

            {transaction.status === 'funded' && (
              <Button
                mode="contained"
                onPress={handleInitiateDelivery}
                loading={processing}
                disabled={processing}
                style={styles.actionButton}
              >
                Initiate Delivery
              </Button>
            )}

            {transaction.status === 'in_transit' && !qrCodeImage && (
              <Button
                mode="contained"
                onPress={handleInitiateDelivery}
                loading={processing}
                disabled={processing}
                style={styles.actionButton}
              >
                Generate QR Code
              </Button>
            )}

            {transaction.status === 'in_transit' && (
              <Button
                mode="contained"
                onPress={handleScanQR}
                style={styles.actionButton}
                icon="qrcode-scan"
              >
                Scan QR Code to Confirm Delivery
              </Button>
            )}

            {transaction.status === 'on_hold' && (
              <View>
                <Text variant="bodyMedium" style={styles.holdInfo}>
                  Funds are on 12hr hold. Will be released automatically.
                </Text>
                {transaction.holdReleaseAt && (
                  <Text variant="bodySmall" style={styles.holdTime}>
                    Release time: {new Date(transaction.holdReleaseAt).toLocaleString()}
                  </Text>
                )}
              </View>
            )}

            {(transaction.status === 'in_transit' || transaction.status === 'on_hold' || transaction.status === 'delivered') && !transaction.dispute?.filedAt && (
              <Button
                mode="outlined"
                onPress={() => setShowDisputeForm(true)}
                style={styles.actionButton}
                icon="alert-circle"
                buttonColor="#e91e63"
              >
                File Dispute
              </Button>
            )}

            {showDisputeForm && (
              <View style={styles.disputeForm}>
                <TextInput
                  label="Dispute Reason"
                  value={disputeReason}
                  onChangeText={setDisputeReason}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  placeholder="Describe the issue with the delivered goods..."
                  style={styles.input}
                />
                <View style={styles.disputeActions}>
                  <Button
                    mode="contained"
                    onPress={handleFileDispute}
                    loading={processing}
                    disabled={processing}
                    style={styles.disputeButton}
                    buttonColor="#e91e63"
                  >
                    Submit Dispute
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setShowDisputeForm(false);
                      setDisputeReason('');
                    }}
                    style={styles.disputeButton}
                  >
                    Cancel
                  </Button>
                </View>
              </View>
            )}

            {transaction.dispute?.filedAt && (
              <View style={styles.disputeInfo}>
                <Text variant="titleMedium" style={styles.disputeTitle}>
                  Dispute Filed
                </Text>
                <Text variant="bodyMedium">
                  Reason: {transaction.dispute.reason}
                </Text>
                <Text variant="bodySmall" style={styles.disputeDate}>
                  Filed: {new Date(transaction.dispute.filedAt).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text variant="bodySmall" style={styles.date}>
              Created: {new Date(transaction.createdAt).toLocaleString()}
            </Text>
            {transaction.updatedAt && (
              <Text variant="bodySmall" style={styles.date}>
                Updated: {new Date(transaction.updatedAt).toLocaleString()}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionId: {
    fontWeight: 'bold',
    flex: 1,
  },
  chip: {
    height: 32,
  },
  chipText: {
    color: '#ffffff',
    fontSize: 11,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amount: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  qrCode: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginVertical: 16,
  },
  qrHint: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  actions: {
    marginTop: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  date: {
    color: '#999',
    marginTop: 4,
  },
  holdInfo: {
    color: '#ff9800',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  holdTime: {
    color: '#666',
    marginBottom: 16,
  },
  disputeForm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff3f3',
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  disputeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disputeButton: {
    flex: 0.48,
  },
  disputeInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffe0e0',
    borderRadius: 8,
  },
  disputeTitle: {
    color: '#e91e63',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  disputeDate: {
    color: '#666',
    marginTop: 4,
  },
});

