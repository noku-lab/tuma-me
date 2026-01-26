import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Linking } from 'react-native';
import { Card, Text, Button, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function DeliveryAgentScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      let endpoint;
      if (user?.role === 'delivery_agent') {
        endpoint = '/delivery-agent/assigned-orders';
      } else if (user?.role === 'wholesaler') {
        endpoint = '/deliveries';
      } else {
        endpoint = '/deliveries/my';
      }
      
      const response = await api.get(endpoint);
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDeliveries();
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWhatsApp = (phone, delivery) => {
    const message = `📦 Delivery Update\n\n` +
      `Delivery ID: ${delivery._id}\n` +
      `Status: ${delivery.status?.replace('_', ' ').toUpperCase()}\n` +
      `Recipient: ${delivery.recipientName}\n` +
      `Description: ${delivery.description}\n\n` +
      `Please confirm receipt or provide updates.`;

    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      alert('Please install WhatsApp to send messages');
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      in_transit: '#9c27b0',
      delivered: '#8bc34a',
      completed: '#4caf50',
      cancelled: '#f44336',
    };
    return colors[status] || '#757575';
  };

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      await api.put(`/deliveries/${deliveryId}/status`, { status: newStatus });
      loadDeliveries();
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const renderDelivery = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.deliveryId}>
            Delivery #{item._id?.slice(-8)}
          </Text>
          <Chip
            style={[styles.chip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.chipText}
          >
            {item.status?.replace('_', ' ').toUpperCase()}
          </Chip>
        </View>
        
        <Text variant="bodyMedium" style={styles.description}>
          {item.description}
        </Text>
        
        <View style={styles.recipientInfo}>
          <View style={styles.recipientDetails}>
            <Text variant="titleSmall" style={styles.recipientName}>
              Recipient: {item.recipientName}
            </Text>
            <Text variant="bodySmall" style={styles.address}>
              {item.deliveryAddress?.street}, {item.deliveryAddress?.city}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            {item.recipientPhone && (
              <IconButton
                icon="phone"
                size={20}
                onPress={() => handleCall(item.recipientPhone)}
              />
            )}
            {item.recipientPhone && (
              <IconButton
                icon="whatsapp"
                size={20}
                onPress={() => handleWhatsApp(item.recipientPhone, item)}
              />
            )}
          </View>
        </View>

        <View style={styles.statusActions}>
          {user?.role === 'delivery_agent' && item.status === 'confirmed' && (
            <Button
              mode="outlined"
              size="small"
              onPress={() => updateDeliveryStatus(item._id, 'in_transit')}
              style={styles.statusButton}
            >
              Start Delivery
            </Button>
          )}
          
          {user?.role === 'delivery_agent' && item.status === 'in_transit' && (
            <Button
              mode="contained"
              size="small"
              onPress={() => updateDeliveryStatus(item._id, 'delivered')}
              style={styles.statusButton}
            >
              Mark Delivered
            </Button>
          )}
          
          {user?.role === 'wholesaler' && item.status === 'delivered' && (
            <Button
              mode="outlined"
              size="small"
              onPress={() => updateDeliveryStatus(item._id, 'completed')}
              style={styles.statusButton}
            >
              Complete Order
            </Button>
          )}
        </View>
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
        data={deliveries}
        renderItem={renderDelivery}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No deliveries found
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
  deliveryId: {
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
  recipientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  statusActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  statusButton: {
    minWidth: 100,
  },
  emptyText: {
    color: '#999',
  },
});

