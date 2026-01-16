import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, FAB, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { USER_ROLES } from '../constants/roles';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [lockedFunds, setLockedFunds] = useState(null);
  const [loadingFunds, setLoadingFunds] = useState(false);

  useEffect(() => {
    if (user?.role === USER_ROLES.RETAILER) {
      loadLockedFunds();
    }
  }, [user]);

  const loadLockedFunds = async () => {
    setLoadingFunds(true);
    try {
      const response = await api.get('/locked-funds');
      setLockedFunds(response.data);
    } catch (error) {
      console.error('Error loading locked funds:', error);
    } finally {
      setLoadingFunds(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.welcomeText}>
              Welcome, {user?.name}!
            </Text>
            <Text variant="bodyMedium" style={styles.roleText}>
              Role: {user?.role?.toUpperCase()}
            </Text>
            {user?.role === USER_ROLES.RETAILER && lockedFunds && (
              <View style={styles.fundsContainer}>
                <Text variant="titleMedium" style={styles.fundsLabel}>
                  Locked Funds
                </Text>
                <Text variant="headlineMedium" style={styles.fundsAmount}>
                  ${lockedFunds.balance?.toFixed(2) || '0.00'}
                </Text>
                <Text variant="bodySmall" style={styles.fundsAvailable}>
                  Available: ${lockedFunds.available?.toFixed(2) || '0.00'}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {user?.role === USER_ROLES.RETAILER && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.fundsCard}>
                <View>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Locked Funds Balance
                  </Text>
                  {loadingFunds ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text variant="headlineSmall" style={styles.balanceText}>
                      ${lockedFunds?.balance?.toFixed(2) || '0.00'}
                    </Text>
                  )}
                </View>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('LockedFunds')}
                  style={styles.fundsButton}
                >
                  Manage
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              How It Works
            </Text>
            <View style={styles.step}>
              <Text variant="titleMedium">1. Create Transaction</Text>
              <Text variant="bodyMedium" style={styles.stepDescription}>
                {user?.role === USER_ROLES.RETAILER
                  ? 'Start a new order and fund it securely'
                  : user?.role === USER_ROLES.WHOLESALER
                  ? 'Receive notifications when retailers lock funds'
                  : 'View assigned delivery orders'}
              </Text>
            </View>
            <View style={styles.step}>
              <Text variant="titleMedium">2. Secure Escrow</Text>
              <Text variant="bodyMedium" style={styles.stepDescription}>
                Funds are held safely in our digital ledger until delivery
              </Text>
            </View>
            <View style={styles.step}>
              <Text variant="titleMedium">3. QR Verification</Text>
              <Text variant="bodyMedium" style={styles.stepDescription}>
                {user?.role === USER_ROLES.RETAILER
                  ? 'Scan QR code when you receive your order'
                  : user?.role === USER_ROLES.WHOLESALER
                  ? 'Generate QR code when you dispatch the order'
                  : 'Present QR code to retailer for scanning'}
              </Text>
            </View>
            <View style={styles.step}>
              <Text variant="titleMedium">4. Fund Release</Text>
              <Text variant="bodyMedium" style={styles.stepDescription}>
                {user?.role === USER_ROLES.WHOLESALER
                  ? 'Funds available for withdrawal 24 hours after confirmation'
                  : 'Funds are automatically released after 12hr hold period'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {user?.role === USER_ROLES.RETAILER && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('CreateTransaction')}
            style={styles.actionButton}
            icon="plus"
          >
            Create New Order
          </Button>
        )}

        {user?.role === USER_ROLES.WHOLESALER && (
          <>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('PendingPayouts')}
              style={styles.actionButton}
              icon="cash"
            >
              View Pending Payouts
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('HardwareQR')}
              style={styles.actionButton}
              icon="qrcode"
            >
              Manage Hardware QR
            </Button>
          </>
        )}

        {user?.role === USER_ROLES.DELIVERY_AGENT && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('DeliveryAgent')}
            style={styles.actionButton}
            icon="truck-delivery"
          >
            View Assigned Orders
          </Button>
        )}
      </ScrollView>

      {user?.role === USER_ROLES.RETAILER && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('CreateTransaction')}
        />
      )}
      {user?.role === USER_ROLES.WHOLESALER && (
        <FAB
          icon="bell"
          style={styles.fab}
          onPress={() => navigation.navigate('Notifications')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    backgroundColor: '#6200ee',
  },
  welcomeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  roleText: {
    color: '#ffffff',
    opacity: 0.9,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  step: {
    marginBottom: 16,
  },
  stepDescription: {
    color: '#666',
    marginTop: 4,
  },
  actionButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  fundsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  fundsLabel: {
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
  },
  fundsAmount: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  fundsAvailable: {
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  fundsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceText: {
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 8,
  },
  fundsButton: {
    marginLeft: 16,
  },
});

