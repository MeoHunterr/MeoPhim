const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      ...require('node-libs-react-native'),
      net: require.resolve('react-native-tcp-socket'),
      dgram: require.resolve('react-native-udp'),
      os: require.resolve('react-native-os'),
      fs: require.resolve('react-native-fs'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
