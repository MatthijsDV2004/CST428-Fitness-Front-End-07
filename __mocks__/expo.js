// __mocks__/expo.js
// Completely stub Expo for Jest to avoid triggering Winter runtime.

module.exports = new Proxy(
    {},
    {
      get: () => {
        // return dummy functions or components if anything is accessed
        return () => null;
      },
    }
  );
  