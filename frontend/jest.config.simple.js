// Simplified Jest config that avoids React Native jest files
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.simple.js'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/__tests__/**/*.simple.test.[jt]s?(x)', '**/__tests__/**/*.comprehensive.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { 
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo)/)',
  ],
};
