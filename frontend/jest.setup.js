// Fix for jest-expo React 19 compatibility
if (typeof global !== 'undefined') {
  global.__DEV__ = true;
}

// Mock React Native completely before any imports
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    StyleSheet: {
      create: (styles) => styles,
      absoluteFillObject: {},
      flatten: jest.fn(),
    },
    View: 'View',
    Text: 'Text',
    ScrollView: 'ScrollView',
    Image: 'Image',
    Alert: {
      alert: jest.fn(),
    },
    ActivityIndicator: 'ActivityIndicator',
    KeyboardAvoidingView: 'KeyboardAvoidingView',
  };
}, { virtual: true });

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  },
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const RNPaper = jest.requireActual('react-native-paper');
  return RNPaper;
});

// Mock react-native-qrcode-svg
jest.mock('react-native-qrcode-svg', () => {
  return jest.fn(() => null);
});

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
