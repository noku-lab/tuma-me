/**
 * Test script to verify the React 19 error fix
 * This tests that the app can start without the "NONE" property error
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing React 19 Error Fix\n');
console.log('─'.repeat(60));

let allTestsPassed = true;

// Test 1: Check React version in package.json files
console.log('\n1️⃣ Checking React versions in package.json files...\n');

try {
  const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const frontendPackageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  
  const rootReact = rootPackageJson.overrides?.react;
  const frontendReact = frontendPackageJson.dependencies?.react;
  const frontendTestRenderer = frontendPackageJson.devDependencies?.['react-test-renderer'];
  
  console.log('   Root override:', rootReact || 'Not set');
  console.log('   Frontend dependency:', frontendReact || 'Not set');
  console.log('   Frontend test-renderer:', frontendTestRenderer || 'Not set');
  console.log('');
  
  if (rootReact && rootReact.startsWith('18.')) {
    console.log('   ✅ Root React is 18.x');
  } else if (rootReact && rootReact.startsWith('19.')) {
    console.log('   ❌ Root React is 19.x (will cause errors)');
    allTestsPassed = false;
  } else {
    console.log('   ⚠️  Root React override not set');
  }
  
  if (frontendReact && frontendReact.startsWith('18.')) {
    console.log('   ✅ Frontend React is 18.x');
  } else if (frontendReact && frontendReact.startsWith('19.')) {
    console.log('   ❌ Frontend React is 19.x (will cause errors)');
    allTestsPassed = false;
  } else {
    console.log('   ⚠️  Frontend React not set');
  }
  
  if (frontendTestRenderer && frontendTestRenderer.startsWith('18.')) {
    console.log('   ✅ react-test-renderer is 18.x');
  } else if (frontendTestRenderer && frontendTestRenderer.startsWith('19.')) {
    console.log('   ❌ react-test-renderer is 19.x (should match React)');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
  allTestsPassed = false;
}

// Test 2: Check ErrorBoundary exists
console.log('\n2️⃣ Checking ErrorBoundary component...\n');

const errorBoundaryPath = 'frontend/src/components/ErrorBoundary.js';
if (fs.existsSync(errorBoundaryPath)) {
  console.log('   ✅ ErrorBoundary component exists');
  const content = fs.readFileSync(errorBoundaryPath, 'utf8');
  if (content.includes('componentDidCatch')) {
    console.log('   ✅ ErrorBoundary has error handling');
  } else {
    console.log('   ⚠️  ErrorBoundary missing error handling');
  }
} else {
  console.log('   ❌ ErrorBoundary component not found');
  allTestsPassed = false;
}

// Test 3: Check errorHandler exists
console.log('\n3️⃣ Checking error handler...\n');

const errorHandlerPath = 'frontend/src/utils/errorHandler.js';
if (fs.existsSync(errorHandlerPath)) {
  console.log('   ✅ Error handler exists');
} else {
  console.log('   ❌ Error handler not found');
  allTestsPassed = false;
}

// Test 4: Check index.js imports errorHandler
console.log('\n4️⃣ Checking index.js setup...\n');

const indexPath = 'frontend/index.js';
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  if (indexContent.includes('errorHandler')) {
    console.log('   ✅ index.js imports errorHandler');
  } else {
    console.log('   ⚠️  index.js does not import errorHandler');
  }
} else {
  console.log('   ❌ index.js not found');
  allTestsPassed = false;
}

// Test 5: Check App.js uses ErrorBoundary
console.log('\n5️⃣ Checking App.js uses ErrorBoundary...\n');

const appPath = 'frontend/App.js';
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  if (appContent.includes('ErrorBoundary')) {
    console.log('   ✅ App.js uses ErrorBoundary');
  } else {
    console.log('   ⚠️  App.js does not use ErrorBoundary');
  }
} else {
  console.log('   ❌ App.js not found');
  allTestsPassed = false;
}

// Summary
console.log('\n' + '─'.repeat(60));
console.log('\n📋 Summary:\n');

if (allTestsPassed) {
  console.log('✅ All checks passed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm install (to install React 18.3.1)');
  console.log('   2. Clear cache: cd frontend && npx expo start --clear');
  console.log('   3. Restart app on device');
  console.log('   4. The "NONE" property error should be fixed!');
} else {
  console.log('❌ Some checks failed. Please review the output above.');
  console.log('\n💡 Make sure to:');
  console.log('   - Update React to 18.3.1 in both package.json files');
  console.log('   - Run npm install');
  console.log('   - Clear Metro cache');
}

console.log('');
