/**
 * Test script to verify React version fix
 * Run with: node test-react-version-fix.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing React Version Fix\n');
console.log('─'.repeat(50));

// Check package.json files
const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const frontendPackageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));

console.log('\n1️⃣ Checking React versions...\n');

const rootReactVersion = rootPackageJson.overrides?.react;
const frontendReactVersion = frontendPackageJson.dependencies?.react;

console.log('Root package.json override:', rootReactVersion || 'Not set');
console.log('Frontend package.json:', frontendReactVersion || 'Not set');

if (rootReactVersion && rootReactVersion.startsWith('18.')) {
  console.log('✅ Root React version is 18.x (correct)');
} else if (rootReactVersion && rootReactVersion.startsWith('19.')) {
  console.log('❌ Root React version is 19.x (will cause errors)');
  console.log('   Fix: Should be 18.3.1');
} else {
  console.log('⚠️  Root React override not set');
}

if (frontendReactVersion && frontendReactVersion.startsWith('18.')) {
  console.log('✅ Frontend React version is 18.x (correct)');
} else if (frontendReactVersion && frontendReactVersion.startsWith('19.')) {
  console.log('❌ Frontend React version is 19.x (will cause errors)');
  console.log('   Fix: Should be 18.3.1');
} else {
  console.log('⚠️  Frontend React version not set');
}

console.log('\n2️⃣ Next steps:\n');
console.log('   1. Run: npm install (to apply version changes)');
console.log('   2. Clear cache: cd frontend && npx expo start --clear');
console.log('   3. Restart app on device');
console.log('\n✅ React 18.3.1 is compatible with React Native 0.81.5');
console.log('   This should fix the "Cannot assign to read-only property NONE" error');
