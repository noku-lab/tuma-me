import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Profile
          </Text>
          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.label}>
              Name
            </Text>
            <Text variant="bodyLarge">{user?.name || 'N/A'}</Text>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.label}>
              Email
            </Text>
            <Text variant="bodyLarge">{user?.email || 'N/A'}</Text>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.label}>
              Role
            </Text>
            <Text variant="bodyLarge" style={styles.role}>
              {user?.role?.toUpperCase() || 'N/A'}
            </Text>
          </View>

          {user?.phone && (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.label}>
                Phone
              </Text>
              <Text variant="bodyLarge">{user.phone}</Text>
            </View>
          )}

          <Divider style={styles.divider} />

          {user?.role === 'retailer' && (
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('LockedFunds')}
              style={styles.button}
              icon="wallet"
            >
              Manage Locked Funds
            </Button>
          )}

          {user?.role === 'wholesaler' && (
            <>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Withdrawal')}
                style={styles.button}
                icon="bank"
              >
                Withdraw Funds
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('PendingPayouts')}
                style={styles.button}
                icon="cash"
              >
                Pending Payouts
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Notifications')}
                style={styles.button}
                icon="bell"
              >
                Notifications
              </Button>
            </>
          )}

          {user?.role === 'delivery_agent' && (
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('DeliveryAgent')}
              style={styles.button}
              icon="truck-delivery"
            >
              My Deliveries
            </Button>
          )}

          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.button}
            buttonColor="#b00020"
          >
            Sign Out
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
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  role: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
});

