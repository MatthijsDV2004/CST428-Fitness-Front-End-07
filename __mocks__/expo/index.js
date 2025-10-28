// Shadow the real Expo package so Jest never executes expo/src/winter/*
module.exports = new Proxy(
    {},
    {
      get: () => () => null,
    }
  );
  