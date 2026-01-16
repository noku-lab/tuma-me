# Tuma-Me - Escrow Platform

A React Native app implementing a centralized platform-escrow model where the platform acts as a trusted intermediary holding funds in a digital ledger until delivery is confirmed via secure QR scan.

## Features

### Retailer Features
- **Order Creation**: Create orders to secure stock without carrying physical cash
- **Locked Funds Management**: View and adjust your locked funds balance (add/subtract)
- **Multiple Payment Methods**: Pay via EcoCash, Bank Transfer, or Cash (via agents/booths)
- **Fast QR Scanning**: Scan QR codes in under 10 seconds to confirm delivery
- **12-Hour Hold**: Funds placed on 12hr hold after delivery confirmation for safety
- **Dispute Filing**: File disputes if delivered goods are damaged

### Wholesaler Features
- **Funds Locked Notifications**: Receive notifications when retailers lock funds with order details
- **Hardware QR Generators**: Register and manage hardware QR code generators
- **QR Code Generation**: Generate secure QR codes for delivery (48hr expiration with extension support)
- **Pending Payouts**: View all pending payouts to manage cash flow
- **24-Hour Withdrawal**: Funds available for withdrawal 24 hours after delivery confirmation
- **Withdrawal Management**: Request withdrawals to bank account

### Delivery Agent Features
- **Assigned Orders**: View all orders assigned for delivery
- **Retailer Contact**: Access retailer delivery address and contact information
- **QR Code Presentation**: Present QR codes to retailers with real-time scan confirmation
- **Success Vibration**: Receive haptic feedback when QR code is successfully scanned

### Platform Features
- **Escrow System**: Funds held securely in digital ledger until delivery confirmation
- **Digital Ledger**: All transactions tracked in a centralized ledger linked to merchant bank account
- **Multi-role Support**: Retailers, Wholesalers, Delivery Agents, and Platform Admins
- **Notification System**: Real-time notifications for funds locked, QR scans, and delivery assignments
- **Automatic Fund Release**: Background job automatically releases funds after 12hr hold period
- **Real-time Updates**: Transaction status updates in real-time

## Prerequisites

**IMPORTANT**: This project requires:
- **Node.js >= 18.0.0** (currently you have v12.18.3 - please upgrade)
- **npm >= 9.0.0**
- MongoDB (or your preferred database)
- React Native development environment

### Upgrading Node.js

If you're using Node Version Manager (nvm):
```bash
nvm install 18
nvm use 18
```

Or download from [nodejs.org](https://nodejs.org/)

## Project Structure

```
tuma-me/
├── frontend/          # React Native app
├── backend/           # Node.js/Express API
└── README.md
```

## Setup

### Installation

1. **Upgrade Node.js** to version 18 or higher (see Prerequisites above)

2. Install all dependencies:
```bash
npm run install:all
```

3. Configure environment variables:
   - Create `backend/.env` with:
     ```
     MONGODB_URI=mongodb://localhost:27017/tuma-me
     JWT_SECRET=your-secret-key-here
     PORT=3000
     MERCHANT_ACCOUNT_ID=default-merchant
     QR_CODE_EXPIRY_HOURS=48
     ENABLE_BACKGROUND_JOBS=true
     ```
   - Create `frontend/.env` with:
     ```
     EXPO_PUBLIC_API_URL=http://localhost:3000/api
     ```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the development servers:
```bash
npm run dev
```

## Architecture

### Escrow Flow (Retailer-Wholesaler)

1. **Order Creation**: Retailer creates an order and funds are locked in escrow
2. **Payment**: Retailer pays via EcoCash/Bank Transfer/Cash (funds locked in platform)
3. **Delivery Initiation**: Wholesaler initiates delivery and generates QR code
4. **QR Verification**: Retailer scans QR code upon delivery receipt (<10 seconds)
5. **12-Hour Hold**: Funds placed on 12hr hold after confirmation
6. **Automatic Release**: Platform automatically releases funds to wholesaler after 12hrs
7. **Withdrawal**: Wholesaler can withdraw funds 24 hours after delivery confirmation
8. **Ledger Update**: All actions recorded in digital ledger linked to merchant account

### Security

- JWT-based authentication
- Encrypted QR codes with expiration
- Transaction verification
- Role-based access control

## Troubleshooting

### Installation Errors

If you encounter errors during installation:

1. **Node version too old**: Upgrade to Node.js 18+ (see Prerequisites)
2. **Package version conflicts**: Delete `node_modules` and `package-lock.json` files, then reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   rm -rf frontend/node_modules frontend/package-lock.json
   rm -rf backend/node_modules backend/package-lock.json
   npm run install:all
   ```
3. **MongoDB connection issues**: Ensure MongoDB is running and the connection string in `backend/.env` is correct

## License

MIT
