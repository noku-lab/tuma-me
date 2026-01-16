/**
 * Comprehensive API service tests
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  const mockAxios = actualAxios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return {
    ...actualAxios,
    create: jest.fn(() => mockAxios),
  };
});

jest.mock('@react-native-async-storage/async-storage');

// Import api after mocks are set up
const api = require('../api').default;

describe('API Service - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.removeItem.mockResolvedValue();
  });

  test('should create axios instance with correct configuration', () => {
    expect(api.defaults.baseURL).toBeDefined();
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  test('should add authorization header when token exists', async () => {
    const token = 'test-token-123';
    AsyncStorage.getItem.mockResolvedValue(token);

    const config = { headers: {} };
    const interceptor = api.interceptors.request.handlers[0];
    const result = await interceptor.fulfilled(config);

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('userToken');
    expect(result.headers.Authorization).toBe(`Bearer ${token}`);
  });

  test('should not add authorization header when token is missing', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const config = { headers: {} };
    const interceptor = api.interceptors.request.handlers[0];
    const result = await interceptor.fulfilled(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  test('should handle 401 errors by clearing storage', async () => {
    const error = {
      response: {
        status: 401,
      },
    };

    const interceptor = api.interceptors.response.handlers[0];
    
    await expect(interceptor.rejected(error)).rejects.toEqual(error);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userData');
  });

  test('should not clear storage on non-401 errors', async () => {
    const error = {
      response: {
        status: 500,
      },
    };

    const interceptor = api.interceptors.response.handlers[0];
    
    await expect(interceptor.rejected(error)).rejects.toEqual(error);
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  });

  test('should handle successful responses', async () => {
    const response = { data: { success: true } };
    const interceptor = api.interceptors.response.handlers[0];
    const result = interceptor.fulfilled(response);

    expect(result).toEqual(response);
  });
});
