# Fix: "Cannot assign to read-only property 'NONE'" Error

## Problem

The error "Cannot assign to read-only property 'NONE'" occurs because:
- **React 19** introduced stricter read-only properties
- React Native libraries (like `react-native-safe-area-context`, `react-native-paper`) try to modify these properties
- This causes a runtime error on iOS/Android

## Solution Applied

✅ **Downgraded React from 19.1.0 to 18.3.1**
- React 18.3.1 is stable and fully compatible with React Native 0.81.5
- React 19 is too new and has breaking changes

## Changes Made

1. **Root `package.json`** - Updated override:
   ```json
   "react": "18.3.1",
   "react-dom": "18.3.1"
   ```

2. **Frontend `package.json`** - Updated dependency:
   ```json
   "react": "18.3.1"
   ```

3. **Frontend `package.json`** - Updated devDependency:
   ```json
   "react-test-renderer": "18.3.1"
   ```

4. **Added Error Boundary** - Catches React errors and logs them to terminal

5. **Added Error Handler** - Captures all errors from device

## Steps to Apply Fix

### Step 1: Install Updated Dependencies
```bash
npm install
```

This will install React 18.3.1 instead of 19.1.0

### Step 2: Clear Metro Cache
```bash
cd frontend
npx expo start --clear
```

Or:
```bash
npm start -- --clear
```

### Step 3: Restart App
- Close the app on your device
- Reload it (shake device → "Reload" or restart Expo)

## Testing

After applying the fix, test:

1. **App starts without error**
2. **Sign up works** - Try registering with different roles
3. **Sign in works** - Try logging in
4. **No "NONE" property errors**

## Verification

Run the test script to verify versions:
```bash
node test-react-version-fix.js
```

Should show:
```
✅ Root React version is 18.x (correct)
✅ Frontend React version is 18.x (correct)
```

## Why This Works

- React 18.3.1 is the **stable, recommended version** for React Native 0.81.5
- React 19 introduced breaking changes that many React Native libraries don't support yet
- The "NONE" property error is a known React 19 compatibility issue
- Downgrading to React 18 resolves the conflict

## If Error Persists

1. **Clear all caches:**
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   npx expo start --clear
   ```

2. **Check for other React 19 references:**
   ```bash
   grep -r "react.*19" frontend/package.json
   ```

3. **Verify installation:**
   ```bash
   cd frontend
   npm list react
   ```
   Should show: `react@18.3.1`

## Notes

- React 19 is very new (released late 2024)
- Most React Native libraries haven't updated for React 19 yet
- React 18.3.1 is the safe, stable choice for production
- This fix is recommended by Expo and React Native community
