const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Ledger = require('../models/Ledger');
const Transaction = require('../models/Transaction');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/locked-funds
// @desc    Get retailer's locked funds balance
// @access  Private (Retailer)
router.get('/', auth, requireRole('retailer'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Calculate actual locked funds from pending/funded transactions
    const lockedTransactions = await Transaction.find({
      retailer: req.user._id,
      status: { $in: ['pending', 'funded', 'in_transit', 'on_hold'] }
    });

    const actualLocked = lockedTransactions.reduce((sum, txn) => sum + txn.amount, 0);

    res.json({
      balance: user.lockedFunds || 0,
      actualLocked,
      available: Math.max(0, (user.lockedFunds || 0) - actualLocked),
      currency: 'USD'
    });
  } catch (error) {
    console.error('Get locked funds error:', error);
    res.status(500).json({ error: 'Server error fetching locked funds' });
  }
});

// @route   POST /api/locked-funds/adjust
// @desc    Adjust locked funds balance (add or subtract)
// @access  Private (Retailer)
router.post('/adjust', auth, requireRole('retailer'), [
  body('amount').isFloat(),
  body('type').isIn(['add', 'subtract']),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, type, reason } = req.body;
    const user = await User.findById(req.user._id);

    if (type === 'subtract' && (user.lockedFunds || 0) < amount) {
      return res.status(400).json({ error: 'Insufficient locked funds' });
    }

    const adjustment = type === 'add' ? amount : -amount;
    const oldBalance = user.lockedFunds || 0;
    user.lockedFunds = Math.max(0, oldBalance + adjustment);
    await user.save();

    // Create ledger entry
    const ledgerEntry = new Ledger({
      transactionId: 'ADJUSTMENT',
      type: 'adjustment',
      amount: Math.abs(adjustment),
      from: type === 'add' ? 'external' : `retailer-${req.user._id}`,
      to: type === 'add' ? `retailer-${req.user._id}` : 'external',
      balance: user.lockedFunds,
      description: reason || `Locked funds ${type === 'add' ? 'added' : 'subtracted'}: ${reason || 'Manual adjustment'}`,
      merchantAccountId: process.env.MERCHANT_ACCOUNT_ID || 'default-merchant',
      metadata: {
        userId: req.user._id.toString(),
        adjustmentType: type,
        reason: reason || 'Manual adjustment'
      }
    });

    await ledgerEntry.save();

    res.json({
      oldBalance,
      newBalance: user.lockedFunds,
      adjustment: adjustment,
      ledgerEntry
    });
  } catch (error) {
    console.error('Adjust locked funds error:', error);
    res.status(500).json({ error: 'Server error adjusting locked funds' });
  }
});

module.exports = router;

