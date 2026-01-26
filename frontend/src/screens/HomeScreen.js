import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { USER_ROLES } from '../constants/roles';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

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
            <Text variant="bodyMedium" style={styles.subtitle}>
              Simple Delivery Management with WhatsApp
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              How It Works
            </Text>
            <View style={styles.step}>
              <Text variant="titleMedium">1. Create Delivery</Text>
              <Text variant="bodyMedium" style={styles.stepDescription}>
                {user?.role === USER_ROLES.RETAILER
                  ? 'Log what you want to send and recipient details'
                  : user?.role === USER_ROLES.WHOLESALER
                  ? 'Receive delivery requests via WhatsApp'
                  : 'View assigned delivery orders'}
              </Text>
            </View>
            <View style={styles.step}>
              <Text variant="titleMedium">2. WhatsApp Notification</Text>
              <Text variant="bodyMedium" style={styles.stepDescription}>
                Automatic WhatsApp message sent to recipient with delivery details
              </Text>
            </View>
            <View style={styles.step}>
              <Text variant="titleMedium">3. Track Delivery</Text>
              <Text variant="bodyMedium" style={styles.stepDescription}>
                Monitor delivery status and communicate via WhatsApp
              </Text>
            </View>
            <View style={styles.step}>
              <Text variant="titleMedium">4. Confirmation</Text>
              <Text variant="bodyMedium" style={styles.stepDescription}>
                Simple delivery confirmation without complex payment systems
              </Text>
            </View>
          </Card.Content>
        </Card>

        {user?.role === USER_ROLES.RETAILER && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('CreateDelivery')}
            style={styles.actionButton}
            icon="plus"
          >
            Create New Delivery
          </Button>
        )}

        {user?.role === USER_ROLES.WHOLESALER && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Deliveries')}
            style={styles.actionButton}
            icon="truck-delivery"
          >
            View All Deliveries
          </Button>
        )}

        {user?.role === USER_ROLES.DELIVERY_AGENT && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Deliveries')}
            style={styles.actionButton}
            icon="truck-delivery"
          >
            View My Deliveries
          </Button>
        )}
      </ScrollView>

      {user?.role === USER_ROLES.RETAILER && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('CreateDelivery')}
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
  subtitle: {
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 8,
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
});

