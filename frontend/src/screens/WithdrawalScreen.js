import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function WithdrawalScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [available, setAvailable] = useState(null);
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  useEffect(() => {
    loadAvailable();
  }, []);

  const loadAvailable = async () => {
    try {
      const response = await api.get('/withdrawals/available');
      setAvailable(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load available balance');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > available.availableAmount) {
      Alert.alert('Error', 'Amount exceeds available balance');
      return;
    }

    setProcessing(true);
    try {
      await api.post('/withdrawals', {
        amount: parseFloat(amount),
        bankAccount: bankAccount || undefined
      });

      Alert.alert('Success', 'Withdrawal request processed successfully');
      setAmount('');
      setBankAccount('');
      loadAvailable();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to process withdrawal');
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
            Available for Withdrawal
          </Text>

          <View style={styles.balanceContainer}>
            <Text variant="headlineMedium" style={styles.balance}>
              ${available?.availableAmount?.toFixed(2) || '0.00'}
            </Text>
            <Text variant="bodyMedium" style={styles.currency}>
              {available?.currency || 'USD'}
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.hint}>
            Funds become available 24 hours after delivery confirmation
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Request Withdrawal
          </Text>

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            style={styles.input}
            keyboardType="decimal-pad"
            left={<TextInput.Icon icon="currency-usd" />}
            placeholder={`Max: $${available?.availableAmount?.toFixed(2) || '0.00'}`}
          />

          <TextInput
            label="Bank Account (Optional)"
            value={bankAccount}
            onChangeText={setBankAccount}
            mode="outlined"
            style={styles.input}
            placeholder="Account number or reference"
          />

          <Button
            mode="contained"
            onPress={handleWithdraw}
            loading={processing}
            disabled={processing || !amount || parseFloat(amount) <= 0}
            style={styles.button}
          >
            Request Withdrawal
          </Button>

          <Text variant="bodySmall" style={styles.hint}>
            Withdrawal will be processed to your registered bank account
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

