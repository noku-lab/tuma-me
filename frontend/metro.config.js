// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure proper module resolution
config.resolver.sourceExts.push('cjs');

// Add root node_modules to watchFolders for workspace support
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
config.watchFolders = [workspaceRoot];

// Ensure React Native from workspace root is transformed
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
