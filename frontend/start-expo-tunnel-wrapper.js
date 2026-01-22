/**
 * Wrapper script to suppress "fetch failed" errors from Expo dependency validation
 * This error is non-critical and doesn't affect functionality
 */

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.EXPO_NO_TELEMETRY = '1';
process.env.EXPO_DOCTOR_SKIP_DEPENDENCY_VERSION_CHECK = '1';
process.env.EXPO_DOCTOR_ENABLE_DIRECTORY_CHECK = '0';
process.env.NODE_OPTIONS = '--no-warnings';

// Filter out the "fetch failed" error from output
const filterFetchError = (data) => {
  const lines = data.toString().split('\n');
  const filtered = lines.filter(line => {
    // Filter out the specific fetch failed error
    if (line.includes('TypeError: fetch failed') && 
        line.includes('getNativeModuleVersionsAsync')) {
      return false;
    }
    // Filter out stack traces related to this error
    if (line.includes('at getNativeModuleVersionsAsync') ||
        line.includes('at validateDependenciesVersionsAsync') ||
        line.includes('at getVersionedNativeModulesAsync') ||
        line.includes('at getCombinedKnownVersionsAsync') ||
        line.includes('at getVersionedDependenciesAsync')) {
      return false;
    }
    return true;
  });
  return filtered.join('\n');
};

// Start Expo with tunnel
const expoProcess = spawn('npx', ['expo', 'start', '--tunnel', '--clear'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
  env: { ...process.env }
});

// Handle stdout - filter and display
expoProcess.stdout.on('data', (data) => {
  const filtered = filterFetchError(data);
  if (filtered.trim()) {
    process.stdout.write(filtered);
  }
});

// Handle stderr - filter and display
expoProcess.stderr.on('data', (data) => {
  const filtered = filterFetchError(data);
  if (filtered.trim()) {
    process.stderr.write(filtered);
  }
});

// Handle process exit
expoProcess.on('exit', (code) => {
  process.exit(code);
});

// Handle errors
expoProcess.on('error', (error) => {
  console.error('Error starting Expo:', error);
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  expoProcess.kill('SIGINT');
  process.exit(0);
});
