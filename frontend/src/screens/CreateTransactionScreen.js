import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

export default function CreateTransactionScreen() {
  const navigation = useNavigation();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [formData, setFormData] = useState({
    wholesalerId: '',
    amount: '',
    description: '',
    paymentMethod: 'ecocash',
    cashCollectionMethod: 'agent',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      // In a real app, you'd have an endpoint to get sellers
      // For now, we'll use a placeholder
      const response = await api.get('/auth/me');
      // This is a simplified version - you'd need a proper sellers endpoint
      setSellers([]);
    } catch (error) {
      console.error('Error loading sellers:', error);
    } finally {
      setLoadingSellers(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.wholesalerId || !formData.amount || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/transactions', {
        wholesalerId: formData.wholesalerId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        cashCollectionMethod: formData.paymentMethod === 'cash' ? formData.cashCollectionMethod : undefined,
        deliveryAddress: formData.deliveryAddress,
      });

      Alert.alert('Success', 'Transaction created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('TransactionDetail', { transactionId: response.data._id }),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Create New Transaction
          </Text>

          <TextInput
            label="Wholesaler Email"
            value={formData.wholesalerId}
            onChangeText={(text) => setFormData({ ...formData, wholesalerId: text })}
            mode="outlined"
            style={styles.input}
            placeholder="Enter wholesaler email or ID"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Amount"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            mode="outlined"
            style={styles.input}
            keyboardType="decimal-pad"
            left={<TextInput.Icon icon="currency-usd" />}
          />

          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Order description (e.g., Stock items, quantities)"
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Payment Method
          </Text>

          <SegmentedButtons
            value={formData.paymentMethod}
            onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
            buttons={[
              { value: 'ecocash', label: 'EcoCash' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'cash', label: 'Cash' },
            ]}
            style={styles.segmentedButtons}
          />

          {formData.paymentMethod === 'cash' && (
            <SegmentedButtons
              value={formData.cashCollectionMethod}
              onValueChange={(value) => setFormData({ ...formData, cashCollectionMethod: value })}
              buttons={[
                { value: 'agent', label: 'EcoCash Agent' },
                { value: 'booth', label: 'Platform Booth' },
              ]}
              style={styles.segmentedButtons}
            />
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Delivery Address
          </Text>

          <TextInput
            label="Street"
            value={formData.deliveryAddress.street}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                deliveryAddress: { ...formData.deliveryAddress, street: text },
              })
            }
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              label="City"
              value={formData.deliveryAddress.city}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  deliveryAddress: { ...formData.deliveryAddress, city: text },
                })
              }
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="State"
              value={formData.deliveryAddress.state}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  deliveryAddress: { ...formData.deliveryAddress, state: text },
                })
              }
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="ZIP Code"
              value={formData.deliveryAddress.zipCode}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  deliveryAddress: { ...formData.deliveryAddress, zipCode: text },
                })
              }
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
            <TextInput
              label="Country"
              value={formData.deliveryAddress.country}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  deliveryAddress: { ...formData.deliveryAddress, country: text },
                })
              }
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Create Transaction
          </Button>
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
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
});

