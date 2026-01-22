# Expo Start Script (Regular Mode)
# Uses wrapper to suppress "fetch failed" errors

cd $PSScriptRoot

# Use Node.js wrapper to suppress "fetch failed" errors
# The error is non-critical and doesn't affect functionality
node start-expo-wrapper.js
