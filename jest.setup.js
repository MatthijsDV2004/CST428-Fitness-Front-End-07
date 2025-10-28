// jest.setup.js

// Define process.env safely before any modules are imported
if (!process.env) {
    global.process = { env: {} };
  }
  
  process.env.EXPO_PUBLIC_API_URL = "https://mock-api-url-for-tests.com";
  