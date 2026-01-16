import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, TextInput, Button, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function LockedFundsScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [balance, setBalance] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await api.get('/locked-funds');
      setBalance(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load locked funds balance');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      await api.post('/locked-funds/adjust', {
        amount: parseFloat(amount),
        type: adjustmentType,
        reason: reason || undefined
      });

      Alert.alert('Success', `Funds ${adjustmentType === 'add' ? 'added' : 'subtracted'} successfully`);
      setAmount('');
      setReason('');
      loadBalance();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to adjust funds');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Locked Funds Balance
          </Text>

          <View style={styles.balanceContainer}>
            <Text variant="headlineMedium" style={styles.balance}>
              ${balance?.balance?.toFixed(2) || '0.00'}
            </Text>
            <Text variant="bodyMedium" style={styles.currency}>
              {balance?.currency || 'USD'}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Committed to Orders:</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                ${balance?.actualLocked?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Available:</Text>
              <Text variant="bodyMedium" style={[styles.infoValue, styles.available]}>
                ${balance?.available?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Adjust Balance
          </Text>

          <SegmentedButtons
            value={adjustmentType}
            onValueChange={setAdjustmentType}
            buttons={[
              { value: 'add', label: 'Add Funds' },
              { value: 'subtract', label: 'Subtract Funds' }
            ]}
            style={styles.segmentedButtons}
          />

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            style={styles.input}
            keyboardType="decimal-pad"
            left={<TextInput.Icon icon="currency-usd" />}
          />

          <TextInput
            label="Reason (Optional)"
            value={reason}
            onChangeText={setReason}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
            placeholder="e.g., Cash deposit, EcoCash payment, etc."
          />

          <Button
            mode="contained"
            onPress={handleAdjust}
            loading={processing}
            disabled={processing || !amount}
            style={styles.button}
          >
            {adjustmentType === 'add' ? 'Add Funds' : 'Subtract Funds'}
          </Button>

          <Text variant="bodySmall" style={styles.hint}>
            {adjustmentType === 'add'
              ? 'Add funds to your locked balance to create orders'
              : 'Subtract funds if you need to free up capital'}
          </Text>
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
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  balance: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  currency: {
    color: '#666',
    marginTop: 4,
  },
  infoSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoValue: {
    fontWeight: 'bold',
  },
  available: {
    color: '#4caf50',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  hint: {
    marginTop: 12,
    color: '#666',
    textAlign: 'center',
  },
});

