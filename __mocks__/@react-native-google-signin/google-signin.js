// __mocks__/@react-native-google-signin/google-signin.js

export const GoogleSignin = {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({
      idToken: "mock-id-token",
      user: { email: "test@example.com", name: "Mock User" },
    }),
    signOut: jest.fn().mockResolvedValue(null),
    revokeAccess: jest.fn(),
    getCurrentUser: jest.fn().mockResolvedValue({
      idToken: "mock-id-token",
      user: { email: "test@example.com", name: "Mock User" },
    }),
  };
  
  export const statusCodes = {
    SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
    IN_PROGRESS: "IN_PROGRESS",
    PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
  };
  
  export const isSuccessResponse = jest.fn(() => true);
  export const isErrorWithCode = jest.fn(() => false);
  