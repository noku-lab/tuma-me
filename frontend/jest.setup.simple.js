// Simple Jest setup without React Native jest files
jest.mock('react-native', () => require('./__mocks__/react-native.js'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
