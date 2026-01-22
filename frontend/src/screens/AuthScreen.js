import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, Menu } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { USER_ROLES, ROLE_LABELS, DEFAULT_ROLE } from '../constants/roles';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(DEFAULT_ROLE);
  const [roleMenuVisible, setRoleMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useContext(AuthContext);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting to', isLogin ? 'login' : 'register');
      console.log('API URL:', process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api');
      
      if (isLogin) {
        console.log('Login request:', { email });
        const response = await api.post('/auth/login', { email, password });
        console.log('Login response received:', { 
          hasToken: !!response.data.token, 
          hasUser: !!response.data.user 
        });
        await signIn(response.data.token, response.data.user);
        console.log('Sign in completed');
      } else {
        if (!name) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        // Ensure role is valid, default to retailer if not set
        const validRole = role && Object.values(USER_ROLES).includes(role) 
          ? role 
          : DEFAULT_ROLE;
        
        console.log('Register request:', { email, name, role: validRole });
        const response = await api.post('/auth/register', {
          email,
          password,
          name,
          phone: phone || undefined, // Send undefined instead of empty string
          role: validRole,
        });
        console.log('Register response received:', { 
          hasToken: !!response.data.token, 
          hasUser: !!response.data.user 
        });
        await signIn(response.data.token, response.data.user);
        console.log('Sign in completed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code,
      });
      
      // Handle different error types
      if (err.response) {
        // Server responded with error
        const errorData = err.response.data;
        
        // Handle validation errors (array format)
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(e => e.msg || e.message).join(', ');
          setError(errorMessages || 'Validation failed');
        } 
        // Handle single error message
        else if (errorData.error) {
          setError(errorData.error);
        }
        // Handle other error formats
        else if (errorData.message) {
          setError(errorData.message);
        }
        else {
          setError(`Server error (${err.response.status}): ${err.response.statusText}`);
        }
      } 
      // Network error (no response)
      else if (err.request) {
        setError('Network error: Could not reach server. Is the backend running?');
      } 
      // Other errors
      else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {isLogin ? 'Sign in to continue' : 'Join Tuma-Me'}
            </Text>

            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            {!isLogin && (
              <>
                <TextInput
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="words"
                />
                <TextInput
                  label="Phone (Optional)"
                  value={phone}
                  onChangeText={setPhone}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                />
                <View style={styles.roleContainer}>
                  <Text variant="bodyMedium" style={styles.roleLabel}>Role:</Text>
                  <Menu
                    visible={roleMenuVisible}
                    onDismiss={() => setRoleMenuVisible(false)}
                    anchor={
                      <Button
                        mode="outlined"
                        onPress={() => setRoleMenuVisible(true)}
                        style={styles.roleButton}
                        contentStyle={styles.roleButtonContent}
                      >
                        {ROLE_LABELS[role] || 'Select Role'}
                      </Button>
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setRole(USER_ROLES.RETAILER);
                        setRoleMenuVisible(false);
                      }}
                      title={ROLE_LABELS[USER_ROLES.RETAILER]}
                    />
                    <Menu.Item
                      onPress={() => {
                        setRole(USER_ROLES.WHOLESALER);
                        setRoleMenuVisible(false);
                      }}
                      title={ROLE_LABELS[USER_ROLES.WHOLESALER]}
                    />
                    <Menu.Item
                      onPress={() => {
                        setRole(USER_ROLES.DELIVERY_AGENT);
                        setRoleMenuVisible(false);
                      }}
                      title={ROLE_LABELS[USER_ROLES.DELIVERY_AGENT]}
                    />
                    <Menu.Item
                      onPress={() => {
                        setRole(USER_ROLES.ADMIN);
                        setRoleMenuVisible(false);
                      }}
                      title={ROLE_LABELS[USER_ROLES.ADMIN]}
                    />
                  </Menu>
                </View>
              </>
            )}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>

            <Button
              mode="text"
              onPress={() => {
                setIsLogin(!isLogin);
                // Reset role to default when switching to signup
                if (!isLogin) {
                  setRole(DEFAULT_ROLE);
                }
              }}
              style={styles.switchButton}
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    marginBottom: 8,
  },
  roleButton: {
    marginTop: 8,
  },
  roleButtonContent: {
    justifyContent: 'flex-start',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  switchButton: {
    marginTop: 16,
  },
  error: {
    color: '#b00020',
    marginBottom: 16,
    textAlign: 'center',
  },
});

