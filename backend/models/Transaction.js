const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  retailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wholesaler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deliveryAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'funded', 'in_transit', 'delivered', 'on_hold', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['ecocash', 'bank_transfer', 'cash', 'card'],
    required: true
  },
  cashCollectionMethod: {
    type: String,
    enum: ['agent', 'booth', 'none'],
    default: 'none'
  },
  dispute: {
    reason: String,
    filedAt: Date,
    filedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolution: String
  },
  holdReleaseAt: {
    type: Date
  },
  availableForWithdrawalAt: {
    type: Date
  },
  paymentIntentId: {
    type: String
  },
  qrCode: {
    code: String,
    expiresAt: Date,
    scannedAt: Date,
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hardwareGeneratorId: String,
    extendedAt: Date,
    extensionCount: {
      type: Number,
      default: 0
    }
  },
  notificationSent: {
    fundsLocked: {
      sent: Boolean,
      sentAt: Date
    }
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  cancelledAt: Date
});

// Update timestamp on save
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate unique transaction ID
transactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.transactionId = `TXN-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);

