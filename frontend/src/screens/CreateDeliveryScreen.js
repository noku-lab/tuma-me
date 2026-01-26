import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { TextInput, Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function CreateDeliveryScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    description: '',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const handleSubmit = async () => {
    if (!formData.recipientName || !formData.recipientPhone || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/deliveries', {
        ...formData,
        senderId: user._id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        'Success',
        'Delivery created successfully! Sending WhatsApp notification...',
        [
          {
            text: 'OK',
            onPress: () => {
              sendWhatsAppNotification(response.data);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create delivery');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppNotification = (delivery) => {
    const message = `📦 New Delivery Request\n\n` +
      `From: ${user.name}\n` +
      `To: ${formData.recipientName}\n` +
      `Phone: ${formData.recipientPhone}\n` +
      `Description: ${formData.description}\n` +
      `Address: ${formData.deliveryAddress.street}, ${formData.deliveryAddress.city}\n\n` +
      `Please confirm receipt and delivery timeline.`;

    const whatsappUrl = `https://wa.me/${formData.recipientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Info', 'Please install WhatsApp to send notifications');
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Create New Delivery
          </Text>

          <TextInput
            label="Recipient Name"
            value={formData.recipientName}
            onChangeText={(text) => setFormData({ ...formData, recipientName: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Recipient Phone (WhatsApp)"
            value={formData.recipientPhone}
            onChangeText={(text) => setFormData({ ...formData, recipientPhone: text })}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="whatsapp" />}
          />

          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Delivery Address
          </Text>

          <TextInput
            label="Street Address"
            value={formData.deliveryAddress.street}
            onChangeText={(text) => setFormData({
              ...formData,
              deliveryAddress: { ...formData.deliveryAddress, street: text }
            })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="City"
            value={formData.deliveryAddress.city}
            onChangeText={(text) => setFormData({
              ...formData,
              deliveryAddress: { ...formData.deliveryAddress, city: text }
            })}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              label="State"
              value={formData.deliveryAddress.state}
              onChangeText={(text) => setFormData({
                ...formData,
                deliveryAddress: { ...formData.deliveryAddress, state: text }
              })}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="ZIP Code"
              value={formData.deliveryAddress.zipCode}
              onChangeText={(text) => setFormData({
                ...formData,
                deliveryAddress: { ...formData.deliveryAddress, zipCode: text }
              })}
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
            Create Delivery & Send WhatsApp
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
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#6200ee',
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
    color: '#6200ee',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
});
