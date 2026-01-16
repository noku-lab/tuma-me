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

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create axios instance with correct baseURL', () => {
    expect(api.defaults.baseURL).toBeDefined();
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  test('should add authorization token to requests', async () => {
    const token = 'test-token-123';
    AsyncStorage.getItem.mockResolvedValue(token);

    const config = {
      headers: {},
    };

    // Simulate request interceptor
    const interceptor = api.interceptors.request.handlers[0];
    const result = await interceptor.fulfilled(config);

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('userToken');
    expect(result.headers.Authorization).toBe(`Bearer ${token}`);
  });

  test('should not add authorization if no token', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const config = {
      headers: {},
    };

    const interceptor = api.interceptors.request.handlers[0];
    const result = await interceptor.fulfilled(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  test('should handle 401 errors by clearing storage', async () => {
    AsyncStorage.removeItem.mockResolvedValue();

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
});
