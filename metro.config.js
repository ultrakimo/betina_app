// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Reanimated 4 imports `react-native-worklets` from its initializers. On web
// (and in fresh/hoisted installs) Metro can fail to resolve the package, so we
// point it explicitly at the installed copy for every platform. This is purely
// a resolver hint — no app logic changes.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-worklets': path.resolve(__dirname, 'node_modules/react-native-worklets'),
};

module.exports = config;
