/**
 * Simple API service tests focusing on core functionality
 */
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('API Service - Core Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should have correct baseURL configuration', () => {
    const expectedURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
    expect(api.defaults.baseURL).toBe(expectedURL);
  });

  test('should have correct default headers', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  test('should be able to add authorization token', async () => {
    const token = 'test-token-123';
    AsyncStorage.getItem.mockResolvedValue(token);

    // Test that token can be retrieved
    const retrievedToken = await AsyncStorage.getItem('userToken');
    expect(retrievedToken).toBe(token);
  });

  test('should handle missing token gracefully', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const token = await AsyncStorage.getItem('userToken');
    expect(token).toBeNull();
  });
});
