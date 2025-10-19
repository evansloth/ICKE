// Quick script to check if environment variables are loaded
require('dotenv').config();

console.log('🔍 Environment Variables Check:\n');

const vars = [
  'EXPO_PUBLIC_AWS_ACCESS_KEY_ID',
  'EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY',
  'EXPO_PUBLIC_AWS_SESSION_TOKEN',
  'EXPO_PUBLIC_AWS_DEFAULT_REGION'
];

let allSet = true;

vars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const preview = varName.includes('KEY') || varName.includes('TOKEN') 
      ? value.substring(0, 15) + '...'
      : value;
    console.log(`✅ ${varName}: ${preview}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allSet = false;
  }
});

console.log('\n' + (allSet ? '✅ All environment variables are set!' : '❌ Some environment variables are missing!'));

