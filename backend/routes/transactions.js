const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const User = require('../models/User');
const Notification = require('../models/Notification');
const HardwareQRGenerator = require('../models/HardwareQRGenerator');
const { auth, requireRole } = require('../middleware/auth');
const QRCode = require('qrcode');
const crypto = require('crypto');

const router = express.Router();

// @route   POST /api/transactions
// @desc    Create a new transaction/order
// @access  Private (Retailer)
router.post('/', auth, requireRole('retailer'), [
  body('wholesalerId').notEmpty(),
  body('amount').isFloat({ min: 0.01 }),
  body('description').trim().notEmpty(),
  body('paymentMethod').isIn(['ecocash', 'bank_transfer', 'cash', 'card'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { wholesalerId, amount, description, paymentMethod, deliveryAddress, metadata, cashCollectionMethod, deliveryAgentId } = req.body;

    // Create transaction/order
    const transaction = new Transaction({
      retailer: req.user._id,
      wholesaler: wholesalerId,
      deliveryAgent: deliveryAgentId || undefined,
      amount,
      description,
      paymentMethod,
      cashCollectionMethod: paymentMethod === 'cash' ? (cashCollectionMethod || 'agent') : 'none',
      deliveryAddress,
      metadata,
      status: 'pending'
    });

    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Server error creating transaction' });
  }
});

// @route   POST /api/transactions/:id/fund
// @desc    Fund a transaction (hold funds in escrow)
// @access  Private (Retailer)
router.post('/:id/fund', auth, requireRole('retailer'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('retailer', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.retailer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Transaction cannot be funded in current state' });
    }

    // Check if retailer has sufficient locked funds
    const user = await User.findById(req.user._id);
    const lockedTransactions = await Transaction.find({
      retailer: req.user._id,
      status: { $in: ['pending', 'funded', 'in_transit', 'on_hold'] }
    });
    const actualLocked = lockedTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const available = (user.lockedFunds || 0) - actualLocked;
    
    if (available < transaction.amount) {
      return res.status(400).json({ 
        error: 'Insufficient locked funds. Please add funds to your locked balance first.' 
      });
    }

    // Update transaction status
    transaction.status = 'funded';
    transaction.paymentIntentId = req.body.paymentIntentId || `PI-${Date.now()}`;
    await transaction.save();

    // Create ledger entry for holding funds
    const ledgerEntry = new Ledger({
      transactionId: transaction.transactionId,
      type: 'hold',
      amount: transaction.amount,
      from: `retailer-${req.user._id}`,
      to: 'escrow',
      balance: transaction.amount,
      description: `Funds held in escrow for transaction ${transaction.transactionId} via ${transaction.paymentMethod}`,
      merchantAccountId: process.env.MERCHANT_ACCOUNT_ID || 'default-merchant'
    });

    await ledgerEntry.save();

    // Send notification to wholesaler about funds locked
    if (!transaction.notificationSent?.fundsLocked?.sent) {
      const wholesaler = await User.findById(transaction.wholesaler);
      if (wholesaler) {
        const notification = new Notification({
          userId: transaction.wholesaler,
          type: 'funds_locked',
          title: 'Funds Locked - Order Ready',
          message: `Retailer ${transaction.retailer.name} has locked $${transaction.amount.toFixed(2)} for order ${transaction.transactionId}`,
          transactionId: transaction._id,
          data: new Map([
            ['amount', transaction.amount.toString()],
            ['retailerName', transaction.retailer.name],
            ['retailerEmail', transaction.retailer.email],
            ['transactionId', transaction.transactionId]
          ])
        });
        await notification.save();

        transaction.notificationSent = {
          fundsLocked: {
            sent: true,
            sentAt: new Date()
          }
        };
        await transaction.save();
      }
    }

    res.json({ transaction, ledgerEntry });
  } catch (error) {
    console.error('Fund transaction error:', error);
    res.status(500).json({ error: 'Server error funding transaction' });
  }
});

// @route   POST /api/transactions/:id/initiate-delivery
// @desc    Wholesaler initiates delivery and generates QR code
// @access  Private (Wholesaler)
router.post('/:id/initiate-delivery', auth, requireRole('wholesaler'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('retailer', 'name email phone');
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.wholesaler.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (transaction.status !== 'funded') {
      return res.status(400).json({ error: 'Transaction must be funded before delivery' });
    }

    // Check for hardware QR generator if provided
    let hardwareGeneratorId = req.body.hardwareGeneratorId;
    if (hardwareGeneratorId) {
      const generator = await HardwareQRGenerator.findOne({
        deviceId: hardwareGeneratorId,
        $or: [
          { registeredBy: req.user._id },
          { assignedTo: req.user._id }
        ],
        status: 'active'
      });

      if (!generator) {
        return res.status(400).json({ error: 'Invalid or unauthorized hardware QR generator' });
      }

      // Update last used
      generator.lastUsedAt = new Date();
      await generator.save();
    }

    // Generate secure QR code data
    const qrData = {
      transactionId: transaction.transactionId,
      timestamp: Date.now(),
      secret: crypto.randomBytes(32).toString('hex')
    };

    const qrCodeString = JSON.stringify(qrData);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours expiration

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrCodeString);

    // Update transaction
    transaction.status = 'in_transit';
    transaction.qrCode = {
      code: qrCodeString,
      expiresAt,
      generatedBy: req.user._id,
      hardwareGeneratorId: hardwareGeneratorId || undefined,
      extensionCount: 0
    };
    await transaction.save();

    // Send notification to delivery agent if assigned
    if (transaction.deliveryAgent) {
      const notification = new Notification({
        userId: transaction.deliveryAgent,
        type: 'delivery_assigned',
        title: 'New Delivery Assignment',
        message: `You have been assigned to deliver order ${transaction.transactionId} to ${transaction.retailer.name}`,
        transactionId: transaction._id,
        data: new Map([
          ['transactionId', transaction.transactionId],
          ['retailerName', transaction.retailer.name],
          ['retailerPhone', transaction.retailer.phone || ''],
          ['amount', transaction.amount.toString()]
        ])
      });
      await notification.save();
    }

    res.json({
      transaction,
      qrCodeImage,
      qrCodeString,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Initiate delivery error:', error);
    res.status(500).json({ error: 'Server error initiating delivery' });
  }
});

// @route   POST /api/transactions/:id/extend-qr
// @desc    Extend QR code expiration (if delivery takes longer than 48hrs)
// @access  Private (Wholesaler)
router.post('/:id/extend-qr', auth, requireRole('wholesaler'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.wholesaler.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!transaction.qrCode || !transaction.qrCode.code) {
      return res.status(400).json({ error: 'QR code not generated yet' });
    }

    if (transaction.qrCode.scannedAt) {
      return res.status(400).json({ error: 'QR code already scanned' });
    }

    // Extend by 48 hours
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 48);

    transaction.qrCode.expiresAt = newExpiresAt;
    transaction.qrCode.extensionCount = (transaction.qrCode.extensionCount || 0) + 1;
    transaction.qrCode.extendedAt = new Date();
    await transaction.save();

    res.json({
      transaction,
      newExpiresAt: newExpiresAt.toISOString(),
      extensionCount: transaction.qrCode.extensionCount
    });
  } catch (error) {
    console.error('Extend QR error:', error);
    res.status(500).json({ error: 'Server error extending QR code' });
  }
});

// @route   POST /api/transactions/:id/confirm-delivery
// @desc    Retailer confirms delivery via QR scan (places funds on 12hr hold)
// @access  Private (Retailer)
router.post('/:id/confirm-delivery', auth, requireRole('retailer'), [
  body('qrCode').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.findById(req.params.id).populate('wholesaler', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.retailer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (transaction.status !== 'in_transit') {
      return res.status(400).json({ error: 'Transaction is not in transit' });
    }

    // Verify QR code
    const scannedQR = req.body.qrCode;
    let qrData;
    try {
      qrData = typeof scannedQR === 'string' ? JSON.parse(scannedQR) : scannedQR;
    } catch (e) {
      qrData = { code: scannedQR };
    }

    const transactionQR = typeof transaction.qrCode.code === 'string' 
      ? JSON.parse(transaction.qrCode.code) 
      : transaction.qrCode.code;

    if (transactionQR.transactionId !== transaction.transactionId) {
      return res.status(400).json({ error: 'Invalid QR code' });
    }

    // Check expiration
    if (new Date() > transaction.qrCode.expiresAt) {
      return res.status(400).json({ error: 'QR code has expired. Please request a new one from the wholesaler.' });
    }

    // Check if already scanned
    if (transaction.qrCode.scannedAt) {
      return res.status(400).json({ error: 'QR code already scanned' });
    }

    // Update transaction - place on 12hr hold
    transaction.status = 'on_hold';
    transaction.qrCode.scannedAt = new Date();
    transaction.qrCode.scannedBy = req.user._id;
    
    // Set hold release time (12 hours from now)
    const holdReleaseAt = new Date();
    holdReleaseAt.setHours(holdReleaseAt.getHours() + 12);
    transaction.holdReleaseAt = holdReleaseAt;
    
    // Set withdrawal availability (24 hours from now)
    const availableForWithdrawalAt = new Date();
    availableForWithdrawalAt.setHours(availableForWithdrawalAt.getHours() + 24);
    transaction.availableForWithdrawalAt = availableForWithdrawalAt;
    
    await transaction.save();

    // Create ledger entry for hold
    const holdLedger = new Ledger({
      transactionId: transaction.transactionId,
      type: 'hold',
      amount: transaction.amount,
      from: 'escrow',
      to: 'escrow',
      balance: transaction.amount,
      description: `Funds on 12hr hold after delivery confirmation - will release at ${holdReleaseAt.toISOString()}`,
      merchantAccountId: process.env.MERCHANT_ACCOUNT_ID || 'default-merchant'
    });

    await holdLedger.save();

    // Send notification to wholesaler about QR scan
    const notification = new Notification({
      userId: transaction.wholesaler._id,
      type: 'qr_scanned',
      title: 'QR Code Scanned - Delivery Confirmed',
      message: `Retailer has scanned QR code for order ${transaction.transactionId}. Funds will be released in 12 hours.`,
      transactionId: transaction._id,
      data: new Map([
        ['transactionId', transaction.transactionId],
        ['amount', transaction.amount.toString()],
        ['holdReleaseAt', holdReleaseAt.toISOString()]
      ])
    });
    await notification.save();

    // Send notification to delivery agent if assigned
    if (transaction.deliveryAgent) {
      const agentNotification = new Notification({
        userId: transaction.deliveryAgent,
        type: 'qr_scanned',
        title: 'QR Code Scanned Successfully',
        message: `QR code for order ${transaction.transactionId} has been scanned successfully.`,
        transactionId: transaction._id
      });
      await agentNotification.save();
    }

    res.json({
      transaction,
      ledgerEntry: holdLedger,
      message: 'Delivery confirmed. Funds are on 12hr hold and will be released automatically.',
      holdReleaseAt: holdReleaseAt.toISOString(),
      availableForWithdrawalAt: availableForWithdrawalAt.toISOString(),
      success: true // For vibration feedback
    });
  } catch (error) {
    console.error('Confirm delivery error:', error);
    res.status(500).json({ error: 'Server error confirming delivery' });
  }
});

// @route   GET /api/transactions
// @desc    Get user's transactions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, role } = req.query;
    let query = {};

    // Filter by user role
    if (req.user.role === 'retailer') {
      query.retailer = req.user._id;
    } else if (req.user.role === 'wholesaler') {
      query.wholesaler = req.user._id;
    } else if (req.user.role === 'delivery_agent') {
      query.deliveryAgent = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin can see all
    } else {
      query.$or = [
        { retailer: req.user._id },
        { wholesaler: req.user._id },
        { deliveryAgent: req.user._id }
      ];
    }

    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .populate('retailer', 'name email phone')
      .populate('wholesaler', 'name email')
      .populate('deliveryAgent', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error fetching transactions' });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('retailer', 'name email phone')
      .populate('wholesaler', 'name email')
      .populate('deliveryAgent', 'name email phone');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check authorization
    const isRetailer = transaction.retailer._id.toString() === req.user._id.toString();
    const isWholesaler = transaction.wholesaler._id.toString() === req.user._id.toString();
    const isDeliveryAgent = transaction.deliveryAgent && 
      transaction.deliveryAgent._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRetailer && !isWholesaler && !isDeliveryAgent && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Server error fetching transaction' });
  }
});

module.exports = router;

