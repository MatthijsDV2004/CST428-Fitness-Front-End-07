// __mocks__/expo-winter.js
// Fully disable Expo "winter" runtime when running Jest.
module.exports = new Proxy(
    {},
    {
      get: () => undefined,
    }
  );
  