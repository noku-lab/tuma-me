import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './App';

// Import error handler first to set up global handlers
import './src/utils/errorHandler';

// Suppress specific warnings if needed (optional - uncomment to suppress)
// LogBox.ignoreLogs(['Warning: ...']);

// Log app startup
console.log('═══════════════════════════════════════');
console.log('Tuma-Me App Starting...');
console.log('All errors from device will appear here');
console.log('═══════════════════════════════════════');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
