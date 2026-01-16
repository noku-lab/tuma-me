import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import CreateTransactionScreen from './src/screens/CreateTransactionScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import QRScanScreen from './src/screens/QRScanScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LockedFundsScreen from './src/screens/LockedFundsScreen';
import WithdrawalScreen from './src/screens/WithdrawalScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import PendingPayoutsScreen from './src/screens/PendingPayoutsScreen';
import HardwareQRScreen from './src/screens/HardwareQRScreen';
import DeliveryAgentScreen from './src/screens/DeliveryAgentScreen';
import QRPresentationScreen from './src/screens/QRPresentationScreen';
import { AuthContext } from './src/context/AuthContext';
import { theme } from './src/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUserToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const authContext = {
    signIn: async (token, userData) => {
      try {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUserToken(token);
        setUser(userData);
      } catch (error) {
        console.error('Error signing in:', error);
      }
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUserToken(null);
        setUser(null);
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
    user,
    token: userToken,
  };

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <PaperProvider theme={theme}>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <StatusBar style="auto" />
          {userToken == null ? (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Auth" component={AuthScreen} />
            </Stack.Navigator>
          ) : (
            <Stack.Navigator>
              <Stack.Screen 
                name="Main" 
                component={MainTabs} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="CreateTransaction" 
                component={CreateTransactionScreen}
                options={{ title: 'Create Transaction' }}
              />
              <Stack.Screen 
                name="TransactionDetail" 
                component={TransactionDetailScreen}
                options={{ title: 'Transaction Details' }}
              />
              <Stack.Screen 
                name="QRScan" 
                component={QRScanScreen}
                options={{ title: 'Scan QR Code' }}
              />
              <Stack.Screen 
                name="LockedFunds" 
                component={LockedFundsScreen}
                options={{ title: 'Locked Funds' }}
              />
              <Stack.Screen 
                name="Withdrawal" 
                component={WithdrawalScreen}
                options={{ title: 'Withdraw Funds' }}
              />
              <Stack.Screen 
                name="Notifications" 
                component={NotificationsScreen}
                options={{ title: 'Notifications' }}
              />
              <Stack.Screen 
                name="PendingPayouts" 
                component={PendingPayoutsScreen}
                options={{ title: 'Pending Payouts' }}
              />
              <Stack.Screen 
                name="HardwareQR" 
                component={HardwareQRScreen}
                options={{ title: 'Hardware QR Generators' }}
              />
              <Stack.Screen 
                name="DeliveryAgent" 
                component={DeliveryAgentScreen}
                options={{ title: 'My Deliveries' }}
              />
              <Stack.Screen 
                name="QRPresentation" 
                component={QRPresentationScreen}
                options={{ title: 'Present QR Code' }}
              />
              <Stack.Screen 
                name="DeliveryOrderDetail" 
                component={TransactionDetailScreen}
                options={{ title: 'Order Details' }}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </AuthContext.Provider>
    </PaperProvider>
  );
}

