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
      if (isLogin) {
        const response = await api.post('/auth/login', { email, password });
        signIn(response.data.token, response.data.user);
      } else {
        if (!name) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const response = await api.post('/auth/register', {
          email,
          password,
          name,
          phone,
          role,
        });
        signIn(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
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
              onPress={() => setIsLogin(!isLogin)}
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

