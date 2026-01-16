import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function TransactionsScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, [statusFilter]);

  const loadTransactions = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await api.get('/transactions', { params });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      funded: '#2196f3',
      in_transit: '#9c27b0',
      delivered: '#4caf50',
      delivered: '#8bc34a',
      completed: '#4caf50',
      cancelled: '#f44336',
      disputed: '#e91e63',
    };
    return colors[status] || '#757575';
  };

  const renderTransaction = ({ item }) => {
    const isRetailer = user?.role === 'retailer';
    const otherParty = isRetailer ? item.wholesaler : item.retailer;

    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('TransactionDetail', { transactionId: item._id })}
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
          <View style={styles.details}>
            <Text variant="bodyLarge" style={styles.amount}>
              ${item.amount.toFixed(2)} {item.currency}
            </Text>
            <Text variant="bodySmall" style={styles.party}>
              {isRetailer ? 'Wholesaler' : 'Retailer'}: {otherParty?.name || 'N/A'}
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.date}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'funded', label: 'Funded' },
            { value: 'in_transit', label: 'In Transit' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
      </View>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No transactions found
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
  filterContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
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
    marginBottom: 8,
    color: '#666',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  amount: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  party: {
    color: '#666',
  },
  date: {
    marginTop: 4,
    color: '#999',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#999',
  },
});

