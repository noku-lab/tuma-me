const express = require('express');
const Ledger = require('../models/Ledger');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/ledger
// @desc    Get ledger entries
// @access  Private (Admin or transaction participant)
router.get('/', auth, async (req, res) => {
  try {
    const { transactionId, type, startDate, endDate } = req.query;
    let query = {};

    // Admin can see all, others see only their transactions
    if (req.user.role !== 'admin') {
      // Filter by transactionId and verify user is part of transaction
      if (transactionId) {
        query.transactionId = transactionId;
      }
    } else {
      if (transactionId) {
        query.transactionId = transactionId;
      }
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const entries = await Ledger.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(entries);
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ error: 'Server error fetching ledger' });
  }
});

// @route   GET /api/ledger/balance
// @desc    Get current escrow balance
// @access  Private (Admin)
router.get('/balance', auth, requireRole('admin'), async (req, res) => {
  try {
    const merchantAccountId = process.env.MERCHANT_ACCOUNT_ID || 'default-merchant';
    
    // Calculate balance from ledger entries
    const entries = await Ledger.find({ merchantAccountId });
    
    let balance = 0;
    entries.forEach(entry => {
      if (entry.type === 'hold' || entry.type === 'deposit') {
        balance += entry.amount;
      } else if (entry.type === 'release' || entry.type === 'refund') {
        balance -= entry.amount;
      }
    });

    res.json({
      balance,
      currency: 'USD',
      merchantAccountId,
      totalEntries: entries.length
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Server error calculating balance' });
  }
});

// @route   GET /api/ledger/:transactionId
// @desc    Get ledger entries for a specific transaction
// @access  Private
router.get('/:transactionId', auth, async (req, res) => {
  try {
    const entries = await Ledger.find({ transactionId: req.params.transactionId })
      .sort({ createdAt: -1 });

    res.json(entries);
  } catch (error) {
    console.error('Get transaction ledger error:', error);
    res.status(500).json({ error: 'Server error fetching transaction ledger' });
  }
});

module.exports = router;

