import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

export default function PendingPayoutsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payouts, setPayouts] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [payoutsResponse, summaryResponse] = await Promise.all([
        api.get('/payouts/pending'),
        api.get('/payouts/summary')
      ]);
      setPayouts(payoutsResponse.data);
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error('Error loading payouts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status) => {
    const colors = {
      funded: '#2196f3',
      in_transit: '#9c27b0',
      on_hold: '#ff9800',
      delivered: '#8bc34a',
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
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {summary && (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>
              Payout Summary
            </Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Pending
                </Text>
                <Text variant="headlineSmall" style={styles.summaryAmount}>
                  ${summary.pending.amount.toFixed(2)}
                </Text>
                <Text variant="bodySmall" style={styles.summaryCount}>
                  {summary.pending.count} order{summary.pending.count !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>
                  Available
                </Text>
                <Text variant="headlineSmall" style={[styles.summaryAmount, styles.availableAmount]}>
                  ${summary.available.amount.toFixed(2)}
                </Text>
                <Text variant="bodySmall" style={styles.summaryCount}>
                  {summary.available.count} order{summary.available.count !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Pending Payouts
          </Text>
          <Text variant="bodyMedium" style={styles.totalPending}>
            Total: ${payouts?.totalPending?.toFixed(2) || '0.00'}
          </Text>
        </Card.Content>
      </Card>

      {payouts?.payouts?.map((payout) => (
        <Card
          key={payout.transactionId}
          style={styles.card}
          onPress={() => navigation.navigate('TransactionDetail', { transactionId: payout.transactionId })}
        >
          <Card.Content>
            <View style={styles.header}>
              <Text variant="titleMedium" style={styles.transactionId}>
                {payout.transactionId}
              </Text>
              <Chip
                style={[styles.chip, { backgroundColor: getStatusColor(payout.status) }]}
                textStyle={styles.chipText}
              >
                {payout.status.replace('_', ' ').toUpperCase()}
              </Chip>
            </View>
            <Text variant="bodyMedium" style={styles.description}>
              {payout.description}
            </Text>
            <View style={styles.details}>
              <View>
                <Text variant="bodySmall" style={styles.label}>
                  Retailer
                </Text>
                <Text variant="bodyMedium">{payout.retailer?.name || 'N/A'}</Text>
              </View>
              <View style={styles.amountContainer}>
                <Text variant="headlineSmall" style={styles.amount}>
                  ${payout.amount.toFixed(2)}
                </Text>
              </View>
            </View>
            {payout.holdReleaseAt && (
              <Text variant="bodySmall" style={styles.holdInfo}>
                Hold release: {new Date(payout.holdReleaseAt).toLocaleString()}
              </Text>
            )}
            {payout.availableForWithdrawalAt && (
              <Text variant="bodySmall" style={styles.withdrawalInfo}>
                Available for withdrawal: {new Date(payout.availableForWithdrawalAt).toLocaleString()}
              </Text>
            )}
          </Card.Content>
        </Card>
      ))}

      {(!payouts?.payouts || payouts.payouts.length === 0) && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No pending payouts
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
  summaryCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
    backgroundColor: '#6200ee',
  },
  summaryTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryAmount: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  availableAmount: {
    color: '#4caf50',
  },
  summaryCount: {
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalPending: {
    color: '#6200ee',
    fontWeight: 'bold',
    marginTop: 8,
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
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    color: '#666',
    marginBottom: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  holdInfo: {
    color: '#ff9800',
    marginTop: 8,
  },
  withdrawalInfo: {
    color: '#4caf50',
    marginTop: 4,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
});

