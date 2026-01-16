const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  entryId: {
    type: String,
    required: true,
    unique: true
  },
  transactionId: {
    type: String,
    required: true,
    ref: 'Transaction'
  },
  type: {
    type: String,
    enum: ['deposit', 'hold', 'release', 'refund', 'fee', 'adjustment', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  merchantAccountId: {
    type: String,
    required: true
  },
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique entry ID
ledgerSchema.pre('save', async function(next) {
  if (!this.entryId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.entryId = `LEDGER-${timestamp}-${random}`;
  }
  next();
});

// Index for efficient queries
ledgerSchema.index({ transactionId: 1 });
ledgerSchema.index({ createdAt: -1 });
ledgerSchema.index({ merchantAccountId: 1 });

module.exports = mongoose.model('Ledger', ledgerSchema);

