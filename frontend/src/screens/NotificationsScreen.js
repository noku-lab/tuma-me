import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      funds_locked: 'lock',
      delivery_assigned: 'truck-delivery',
      qr_scanned: 'qrcode-scan',
      payment_released: 'cash',
      dispute_filed: 'alert-circle'
    };
    return icons[type] || 'bell';
  };

  const getNotificationColor = (type) => {
    const colors = {
      funds_locked: '#4caf50',
      delivery_assigned: '#2196f3',
      qr_scanned: '#9c27b0',
      payment_released: '#ff9800',
      dispute_filed: '#f44336'
    };
    return colors[type] || '#6200ee';
  };

  const renderNotification = ({ item }) => (
    <Card
      style={[styles.card, !item.read && styles.unreadCard]}
      onPress={() => {
        if (!item.read) markAsRead(item._id);
        if (item.transactionId) {
          navigation.navigate('TransactionDetail', { transactionId: item.transactionId._id || item.transactionId });
        }
      }}
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(item.type) + '20' }]}>
            <IconButton
              icon={getNotificationIcon(item.type)}
              size={24}
              iconColor={getNotificationColor(item.type)}
            />
          </View>
          <View style={styles.content}>
            <Text variant="titleMedium" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              {item.message}
            </Text>
            <Text variant="bodySmall" style={styles.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.headerBar}>
          <Text variant="bodyMedium">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
          <Button mode="text" onPress={markAllAsRead}>
            Mark All Read
          </Button>
        </View>
      )}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No notifications
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    borderRadius: 20,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: '#666',
    marginBottom: 8,
  },
  date: {
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196f3',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyText: {
    color: '#999',
  },
});

