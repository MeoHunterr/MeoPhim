const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const nodeLibs = require('node-libs-react-native');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      ...nodeLibs,
      net: require.resolve('react-native-tcp-socket'),
      dgram: require.resolve('react-native-udp'),
      'asyncstorage-down': path.resolve(__dirname, 'node_modules/asyncstorage-down'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
