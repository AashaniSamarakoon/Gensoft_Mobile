const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Restrict the project root to only the frontend directory
config.projectRoot = __dirname;
config.watchFolders = [__dirname];

// Add resolver configuration for better asset handling
config.resolver.assetExts.push(
  // Add any additional asset extensions if needed
  'bin'
);

// Ensure source extensions are properly configured
config.resolver.sourceExts.push(
  'jsx',
  'js',
  'ts',
  'tsx',
  'json',
  'wasm',
  'svg'
);

// Add Node.js polyfills for React Native
config.resolver.alias = {
  ...config.resolver.alias,
  'events': require.resolve('react-native/Libraries/vendor/emitter/EventEmitter'),
  'stream': require.resolve('stream-browserify'),
  'path': require.resolve('path-browserify'),
  'crypto': require.resolve('react-native-crypto'),
  'Platform': path.resolve(__dirname, 'src/polyfills/PlatformGlobal.js'),
  'react-native$': path.resolve(__dirname, 'src/polyfills/ReactNativePolyfill.js'),
  'fs': false,
  'net': false,
  'tls': false,
  'http': false,
  'https': false,
  'url': false,
  'zlib': false,
  'querystring': false,
};

// Block server-only modules and directories - be very strict about this
config.resolver.blockList = [
  // Block any server-related directories from the parent folder
  new RegExp(path.resolve(__dirname, '..', 'server') + '.*'),
  new RegExp(path.resolve(__dirname, '..', 'middleware') + '.*'),
  new RegExp(path.resolve(__dirname, '..', 'mobile-backend') + '.*'),
  new RegExp(path.resolve(__dirname, '..', 'backend') + '.*'),
  new RegExp(path.resolve(__dirname, '..', 'client') + '.*'),
  
  // Block node_modules with server-related code
  /node_modules\/.*\/server\/.*/,
  /.*\/server\/node_modules\/.*/,
  
  // Block express and other server modules
  /node_modules\/express\/.*/,
  /node_modules\/.*express.*/,
];

// Restrict platforms to mobile only
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Add transformer configuration for better performance
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;