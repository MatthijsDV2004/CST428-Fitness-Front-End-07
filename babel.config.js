module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      // Required by Reanimated; must be last in the list
      plugins: [
        '@babel/plugin-transform-flow-strip-types',
        'react-native-reanimated/plugin',
      ],
    };
  };
  