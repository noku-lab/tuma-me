# Setup Instructions

## Critical: Node.js Version Requirement

**You MUST upgrade Node.js before proceeding!**

Your current Node.js version is **v12.18.3**, but this project requires **Node.js >= 18.0.0**.

### How to Upgrade Node.js

#### Option 1: Using NVM (Recommended)
```bash
# Install nvm-windows from https://github.com/coreybutler/nvm-windows
# Then run:
nvm install 18.20.0
nvm use 18.20.0
```

#### Option 2: Direct Download
1. Download Node.js 18.x or higher from [nodejs.org](https://nodejs.org/)
2. Install it (this will replace your current Node.js)
3. Restart your terminal/PowerShell

### Verify Installation
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

## Installation Steps

After upgrading Node.js:

1. **Clean install** (recommended if you had previous errors):
```bash
# Remove all node_modules and lock files
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
```

2. **Install dependencies**:
```bash
npm run install:all
```

3. **Set up environment variables**:
   - Create `backend/.env`:
     ```
     MONGODB_URI=mongodb://localhost:27017/tuma-me
     JWT_SECRET=your-secret-key-change-this-in-production
     PORT=3000
     MERCHANT_ACCOUNT_ID=default-merchant
     QR_CODE_EXPIRY_HOURS=48
     ENABLE_BACKGROUND_JOBS=true
     ```
   - Create `frontend/.env`:
     ```
     EXPO_PUBLIC_API_URL=http://localhost:3000/api
     ```

4. **Start MongoDB** (if running locally):
```bash
mongod
```

5. **Start development servers**:
```bash
npm run dev
```

## Common Issues

### "No matching version found for expo-barcode-scanner"
- Make sure you're using Node.js 18+
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall

### "Unsupported engine" warnings
- This means your Node.js version is too old
- Upgrade to Node.js 18+ (see above)

### Port already in use
- Metro bundler uses port 8081
- Backend uses port 3000
- Kill processes using these ports or change ports in config

