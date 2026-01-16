# Dependency Sync Verification Report

**Generated:** 2024-12-19  
**Project:** tuma-me

## Summary

The project dependencies are **NOT fully in sync**. Several issues were identified:

### Critical Issues

1. **Lock File Out of Sync**
   - Running `npm install --dry-run` shows 293 packages would be removed and 39 added
   - This indicates `package-lock.json` is significantly out of sync with `package.json` files

2. **Dependency Conflicts**
   - Invalid `react@18.2.0` in root `node_modules` (frontend specifies `react@19.1.0`)
   - Invalid `jest@30.2.0` in root `node_modules` (conflicts with workspace installations)
   - Invalid `metro-react-native-babel-preset@0.77.0`, `serialize-error@2.1.0`, `promise@8.3.0` in root

3. **Missing Dependencies**
   - `react-test-renderer` required by multiple testing libraries but missing in some locations
   - Missing: `pkg-dir@^4.1.0` (required by `find-cache-dir@3.3.2`)
   - Missing: `fs-extra@~8.1.0` (required by `@expo/cli@0.10.17`)
   - Missing: `write-file-atomic@^2.3.0` (required by `@expo/json-file`)
   - Missing: `sudo-prompt@9.1.1` (required by `@expo/package-manager`)

4. **npm Workspaces Configuration Issue**
   - The `install:all` script runs `npm install` separately in root, frontend, and backend
   - With npm workspaces, you should only run `npm install` at the root
   - Running installs separately can cause dependency conflicts and inconsistencies

5. **Security Vulnerabilities**
   - 5 vulnerabilities found (1 moderate, 4 high)
   - **High (4):** `semver@7.0.0-7.5.1` - Regular Expression Denial of Service
     - Affects: `@expo/image-utils` → `expo-pwa` → `@expo/webpack-config`
   - **Moderate (1):** `webpack-dev-server@<=5.2.0` - Source code exposure risk
     - Affects: `@expo/webpack-config`
   - Note: Fixing these requires `npm audit fix --force` which may install breaking changes
   - Recommend running `npm audit fix` after resolving sync issues

## Package Versions Status

### Outdated Packages (Newer versions available)
- `@react-navigation/bottom-tabs`: 6.6.1 → 7.9.0
- `@react-navigation/native`: 6.1.18 → 7.1.26
- `@react-navigation/stack`: 6.4.1 → 7.6.13
- `bcryptjs`: 2.4.3 → 3.0.3
- `concurrently`: 8.2.2 → 9.2.1
- `dotenv`: 16.6.1 → 17.2.3
- `express`: 4.22.1 → 5.2.1
- `mongoose`: 8.21.0 → 9.1.2
- `react`: 19.1.0 → 19.2.3 (patch update)
- `react-test-renderer`: 19.1.0 → 19.2.3 (wanted: 19.2.3)
- `react-native-gesture-handler`: 2.28.0 → 2.30.0
- `react-native-screens`: 4.16.0 → 4.19.0

## Recommendations

### Immediate Actions Required

1. **Fix Lock File Sync**
   ```powershell
   # Remove lock file and node_modules
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force package-lock.json
   Remove-Item -Recurse -Force frontend\node_modules -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force backend\node_modules -ErrorAction SilentlyContinue
   
   # Clean install from root (workspaces will handle everything)
   npm install
   ```

2. **Fix install:all Script**
   - The current script installs dependencies incorrectly for workspaces
   - Update `package.json` script to just run `npm install` at root
   - Or remove it entirely since `npm install` at root handles workspaces

3. **Verify Installation**
   ```powershell
   npm ls --depth=0
   npm ls --all  # Check for remaining issues
   ```

4. **Address Security Issues**
   ```powershell
   npm audit
   npm audit fix  # After resolving sync issues
   ```

### Optional Updates

- Consider updating major versions (especially React Navigation v6 → v7)
- Review breaking changes before major version updates
- Patch updates (like react 19.1.0 → 19.2.3) are generally safe

## Workspace Structure

The project correctly uses npm workspaces:
- Root: `package.json` with workspaces: `["frontend", "backend"]`
- Lock file: Single `package-lock.json` at root (correct for workspaces)
- No individual lock files in frontend/backend (correct for workspaces)

## Current Package.json Files

### Root (`package.json`)
- Workspaces: ✅ Configured correctly
- DevDependencies: `concurrently@^8.2.2`

### Backend (`backend/package.json`)
- Dependencies: 8 packages
- DevDependencies: 4 packages
- Node engine: ✅ `>=18.0.0`

### Frontend (`frontend/package.json`)
- Dependencies: 16 packages
- DevDependencies: 17 packages
- React version: `19.1.0`

## Conclusion

**Status:** ⚠️ **OUT OF SYNC** - Requires immediate attention

The main issue is that the `package-lock.json` file is significantly out of sync with the actual `package.json` files. A clean reinstall from the root directory (which will properly handle npm workspaces) is recommended.
