/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
  
    // Let jest-expo pick the right environment; remove custom jsdom unless you truly need it
    // testEnvironment: 'node',
  
    setupFilesAfterEnv: [
      '<rootDir>/jest.setup.js',
      '@testing-library/jest-native/extend-expect',
    ],
  
    // Recommended pattern from the Expo docs so RN/Expo packages get transformed
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))',
    ],
  
    moduleNameMapper: {
      '^expo-sqlite$': '<rootDir>/__mocks__/expo-sqlite.js',
      '^@/(.*)$': '<rootDir>/$1',
    },
  
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  };
  