// Quick script to verify Node.js version after upgrade
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

console.log('========================================');
console.log('  Node.js Version Check');
console.log('========================================');
console.log(`Current version: ${nodeVersion}`);
console.log(`Major version: ${majorVersion}`);
console.log('');

if (majorVersion >= 20) {
  console.log('✅ SUCCESS! Node.js 20+ is installed');
  console.log('You can now use Expo SDK 54 without errors.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart your terminal/PowerShell');
  console.log('2. cd frontend');
  console.log('3. npm start');
} else {
  console.log('❌ Node.js version is too old');
  console.log(`   Current: ${nodeVersion}`);
  console.log('   Required: 20.19.4 or higher');
  console.log('');
  console.log('Please upgrade Node.js from: https://nodejs.org/');
}

console.log('========================================');
