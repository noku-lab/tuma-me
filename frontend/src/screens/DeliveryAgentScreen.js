import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Linking } from 'react-native';
import { Card, Text, Button, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

export default function DeliveryAgentScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get('/delivery-agent/assigned-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      funded: '#2196f3',
      in_transit: '#9c27b0',
      on_hold: '#ff9800',
      delivered: '#8bc34a',
      completed: '#4caf50',
    };
    return colors[status] || '#757575';
  };

  const renderOrder = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('DeliveryOrderDetail', { orderId: item._id })}
    >
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.transactionId}>
            {item.transactionId}
          </Text>
          <Chip
            style={[styles.chip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.chipText}
          >
            {item.status.replace('_', ' ').toUpperCase()}
          </Chip>
        </View>
        <Text variant="bodyMedium" style={styles.description}>
          {item.description}
        </Text>
        <View style={styles.retailerInfo}>
          <View style={styles.retailerDetails}>
            <Text variant="titleSmall" style={styles.retailerName}>
              {item.retailer?.name || 'N/A'}
            </Text>
            {item.retailer?.phone && (
              <Button
                mode="text"
                icon="phone"
                onPress={() => handleCall(item.retailer.phone)}
                compact
              >
                {item.retailer.phone}
              </Button>
            )}
          </View>
          <Text variant="headlineSmall" style={styles.amount}>
            ${item.amount.toFixed(2)}
          </Text>
        </View>
        {item.deliveryAddress && (
          <View style={styles.addressContainer}>
            <Text variant="bodySmall" style={styles.addressLabel}>
              Delivery Address:
            </Text>
            <Text variant="bodyMedium" style={styles.address}>
              {item.deliveryAddress.street}
              {'\n'}
              {item.deliveryAddress.city}, {item.deliveryAddress.state} {item.deliveryAddress.zipCode}
            </Text>
          </View>
        )}
        {item.qrCode && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('QRPresentation', { transactionId: item._id })}
            style={styles.qrButton}
            icon="qrcode"
          >
            Show QR Code
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No assigned orders
            </Text>
          </View>
        }
      />
    </View>
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
    padding: 32,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionId: {
    fontWeight: 'bold',
    flex: 1,
  },
  chip: {
    height: 28,
  },
  chipText: {
    color: '#ffffff',
    fontSize: 10,
  },
  description: {
    marginBottom: 12,
    color: '#666',
  },
  retailerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  retailerDetails: {
    flex: 1,
  },
  retailerName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  amount: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  addressContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  addressLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  address: {
    color: '#333',
  },
  qrButton: {
    marginTop: 12,
  },
  emptyText: {
    color: '#999',
  },
});

