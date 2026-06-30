const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch the shared folder outside of the mobile directory
const sharedPath = path.resolve(__dirname, '../shared');
config.watchFolders = [sharedPath];

// Ensure Metro resolves packages using mobile's node_modules first
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;
