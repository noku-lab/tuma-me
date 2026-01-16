const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/ledger', require('./routes/ledger'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/locked-funds', require('./routes/lockedFunds'));
app.use('/api/disputes', require('./routes/disputes'));
app.use('/api/withdrawals', require('./routes/withdrawals'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/hardware-qr', require('./routes/hardwareQR'));
app.use('/api/payouts', require('./routes/payouts'));
app.use('/api/delivery-agent', require('./routes/deliveryAgent'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tuma-Me API is running' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tuma-me', {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('MongoDB connected');
  
  // Start background job for releasing held funds only after MongoDB is connected
  if (process.env.ENABLE_BACKGROUND_JOBS !== 'false') {
    const { releaseHeldFunds } = require('./jobs/releaseFunds');
    setInterval(async () => {
      try {
        // Only run if mongoose is connected
        if (mongoose.connection.readyState === 1) {
          await releaseHeldFunds();
        }
      } catch (error) {
        console.error('Background job error:', error);
      }
    }, 5 * 60 * 1000); // Run every 5 minutes
    
    // Run immediately on startup (after connection is established)
    setTimeout(async () => {
      try {
        if (mongoose.connection.readyState === 1) {
          await releaseHeldFunds();
        }
      } catch (error) {
        console.error('Background job error on startup:', error.message);
      }
    }, 2000); // Wait 2 seconds after connection to ensure it's ready
  }
})
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

