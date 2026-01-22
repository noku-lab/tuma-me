# Permanent Fix for Expo "fetch failed" Error

## Problem

The error "TypeError: fetch failed" appears every time you run `expo start --tunnel` because Expo CLI tries to validate dependencies by fetching from Expo's API servers, and this fetch fails.

## Permanent Solution Applied

I've implemented **three layers** of fixes to permanently resolve this:

### 1. Environment Variables (`.env.local`)
Created `frontend/.env.local` with:
```
EXPO_DOCTOR_SKIP_DEPENDENCY_VERSION_CHECK=1
EXPO_DOCTOR_ENABLE_DIRECTORY_CHECK=0
EXPO_NO_TELEMETRY=1
```

### 2. App Configuration (`app.json`)
Added to `app.json`:
```json
"doctor": {
  "reactNativeDirectoryCheck": {
    "enabled": false
  }
}
```

### 3. PowerShell Script (`start-expo-tunnel.ps1`)
Updated script sets environment variables before starting:
```powershell
$env:EXPO_DOCTOR_SKIP_DEPENDENCY_VERSION_CHECK = "1"
$env:EXPO_DOCTOR_ENABLE_DIRECTORY_CHECK = "0"
$env:EXPO_NO_TELEMETRY = "1"
$env:NODE_OPTIONS = "--no-warnings"
```

## How It Works

These settings tell Expo CLI to:
- **Skip dependency version validation** - No API calls to check versions
- **Disable directory checks** - No React Native Directory validation
- **Suppress warnings** - Cleaner output

## Usage

Now you can simply run:
```bash
npm start
# or
npm run start:tunnel
```

The error should **no longer appear**.

## Verification

After applying the fix:
1. The "fetch failed" error should be gone
2. You'll still see "Tunnel connected. Tunnel ready."
3. No more dependency validation errors

## If Error Still Appears

1. **Clear Metro cache:**
   ```bash
   cd frontend
   npx expo start --clear
   ```

2. **Verify .env.local exists:**
   ```bash
   Get-Content frontend\.env.local
   ```

3. **Check app.json has doctor config:**
   ```bash
   Get-Content frontend\app.json | Select-String "doctor"
   ```

4. **Restart terminal** to ensure environment variables are loaded

## Why This Is Permanent

- ✅ **Environment variables** persist in `.env.local`
- ✅ **App configuration** is saved in `app.json`
- ✅ **Script** sets variables every time
- ✅ **No manual steps** needed after setup

The error should now be permanently resolved!
