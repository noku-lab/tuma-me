/**
 * Test script to verify Expo error fix is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Expo Error Fix Configuration\n');
console.log('─'.repeat(60));

let allGood = true;

// Test 1: Check app.json has doctor config
console.log('\n1️⃣ Checking app.json configuration...\n');
try {
  const appJson = JSON.parse(fs.readFileSync('frontend/app.json', 'utf8'));
  if (appJson.expo?.doctor?.reactNativeDirectoryCheck?.enabled === false) {
    console.log('   ✅ Doctor check disabled in app.json');
  } else {
    console.log('   ❌ Doctor check not disabled in app.json');
    allGood = false;
  }
} catch (error) {
  console.log('   ❌ Error reading app.json:', error.message);
  allGood = false;
}

// Test 2: Check .env.local exists
console.log('\n2️⃣ Checking .env.local file...\n');
const envLocalPath = 'frontend/.env.local';
if (fs.existsSync(envLocalPath)) {
  console.log('   ✅ .env.local file exists');
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  if (envContent.includes('EXPO_DOCTOR_SKIP_DEPENDENCY_VERSION_CHECK=1')) {
    console.log('   ✅ Contains EXPO_DOCTOR_SKIP_DEPENDENCY_VERSION_CHECK');
  } else {
    console.log('   ⚠️  Missing EXPO_DOCTOR_SKIP_DEPENDENCY_VERSION_CHECK');
  }
} else {
  console.log('   ⚠️  .env.local file not found (will be created on first run)');
}

// Test 3: Check start-expo-tunnel.ps1 has environment variables
console.log('\n3️⃣ Checking start-expo-tunnel.ps1 script...\n');
const scriptPath = 'frontend/start-expo-tunnel.ps1';
if (fs.existsSync(scriptPath)) {
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  if (scriptContent.includes('EXPO_DOCTOR_SKIP_DEPENDENCY_VERSION_CHECK')) {
    console.log('   ✅ Script sets EXPO_DOCTOR_SKIP_DEPENDENCY_VERSION_CHECK');
  } else {
    console.log('   ❌ Script missing environment variable');
    allGood = false;
  }
} else {
  console.log('   ❌ Script not found');
  allGood = false;
}

// Summary
console.log('\n' + '─'.repeat(60));
console.log('\n📋 Summary:\n');

if (allGood) {
  console.log('✅ All configurations are in place!');
  console.log('\n📝 The "fetch failed" error should be permanently fixed.');
  console.log('\n💡 To test:');
  console.log('   1. Run: npm start (or npm run start:tunnel)');
  console.log('   2. The error should no longer appear');
  console.log('   3. You should only see "Tunnel connected. Tunnel ready."');
} else {
  console.log('⚠️  Some configurations are missing.');
  console.log('   Please check the output above and fix any issues.');
}

console.log('');
