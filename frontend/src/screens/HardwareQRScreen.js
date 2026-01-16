import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, TextInput, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

export default function HardwareQRScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [generators, setGenerators] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [formData, setFormData] = useState({
    deviceId: '',
    serialNumber: '',
    name: ''
  });

  useEffect(() => {
    loadGenerators();
  }, []);

  const loadGenerators = async () => {
    try {
      const response = await api.get('/hardware-qr');
      setGenerators(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load hardware QR generators');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.deviceId || !formData.serialNumber || !formData.name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setProcessing(true);
    try {
      await api.post('/hardware-qr/register', formData);
      Alert.alert('Success', 'Hardware QR generator registered successfully');
      setShowRegister(false);
      setFormData({ deviceId: '', serialNumber: '', name: '' });
      loadGenerators();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to register hardware QR generator');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#4caf50',
      inactive: '#757575',
      lost: '#f44336',
      damaged: '#ff9800'
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

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              Hardware QR Generators
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowRegister(!showRegister)}
              icon={showRegister ? 'close' : 'plus'}
            >
              {showRegister ? 'Cancel' : 'Register New'}
            </Button>
          </View>

          {showRegister && (
            <View style={styles.form}>
              <TextInput
                label="Device ID"
                value={formData.deviceId}
                onChangeText={(text) => setFormData({ ...formData, deviceId: text })}
                mode="outlined"
                style={styles.input}
                placeholder="Unique device identifier"
              />
              <TextInput
                label="Serial Number"
                value={formData.serialNumber}
                onChangeText={(text) => setFormData({ ...formData, serialNumber: text })}
                mode="outlined"
                style={styles.input}
                placeholder="Hardware serial number"
              />
              <TextInput
                label="Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                mode="outlined"
                style={styles.input}
                placeholder="Device name (e.g., Warehouse Scanner 1)"
              />
              <Button
                mode="contained"
                onPress={handleRegister}
                loading={processing}
                disabled={processing}
                style={styles.button}
              >
                Register Device
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {generators.map((generator) => (
        <Card key={generator._id} style={styles.card}>
          <Card.Content>
            <View style={styles.generatorHeader}>
              <View style={styles.generatorInfo}>
                <Text variant="titleMedium" style={styles.generatorName}>
                  {generator.name}
                </Text>
                <Text variant="bodySmall" style={styles.generatorId}>
                  Device ID: {generator.deviceId}
                </Text>
                <Text variant="bodySmall" style={styles.generatorSerial}>
                  Serial: {generator.serialNumber}
                </Text>
              </View>
              <Chip
                style={[styles.chip, { backgroundColor: getStatusColor(generator.status) }]}
                textStyle={styles.chipText}
              >
                {generator.status.toUpperCase()}
              </Chip>
            </View>
            {generator.assignedTo && (
              <Text variant="bodySmall" style={styles.assignedTo}>
                Assigned to: {generator.assignedTo.name}
              </Text>
            )}
            {generator.lastUsedAt && (
              <Text variant="bodySmall" style={styles.lastUsed}>
                Last used: {new Date(generator.lastUsedAt).toLocaleString()}
              </Text>
            )}
          </Card.Content>
        </Card>
      ))}

      {generators.length === 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No hardware QR generators registered
            </Text>
            <Text variant="bodySmall" style={styles.emptyHint}>
              Register a hardware device to generate QR codes for deliveries
            </Text>
          </Card.Content>
        </Card>
      )}
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
    marginTop: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  form: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  generatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  generatorInfo: {
    flex: 1,
  },
  generatorName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  generatorId: {
    color: '#666',
    marginBottom: 2,
  },
  generatorSerial: {
    color: '#666',
  },
  chip: {
    height: 28,
  },
  chipText: {
    color: '#ffffff',
    fontSize: 10,
  },
  assignedTo: {
    color: '#666',
    marginTop: 8,
  },
  lastUsed: {
    color: '#999',
    marginTop: 4,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyHint: {
    color: '#999',
    textAlign: 'center',
  },
});

