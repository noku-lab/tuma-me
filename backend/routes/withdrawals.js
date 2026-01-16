const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/withdrawals/available
// @desc    Get available balance for withdrawal (wholesaler)
// @access  Private (Wholesaler/Seller)
router.get('/available', auth, requireRole('wholesaler'), async (req, res) => {
  try {
    // Get all completed transactions where funds are available for withdrawal
    const transactions = await Transaction.find({
      wholesaler: req.user._id,
      status: 'completed',
      availableForWithdrawalAt: { $lte: new Date() }
    });

    const availableAmount = transactions.reduce((sum, txn) => {
      // Check if already withdrawn
      const withdrawn = txn.metadata?.get?.('withdrawn') || txn.metadata?.withdrawn;
      return withdrawn ? sum : sum + txn.amount;
    }, 0);

    res.json({
      availableAmount,
      currency: 'USD',
      transactionsCount: transactions.length
    });
  } catch (error) {
    console.error('Get available withdrawal error:', error);
    res.status(500).json({ error: 'Server error fetching available balance' });
  }
});

// @route   POST /api/withdrawals
// @desc    Request withdrawal (wholesaler)
// @access  Private (Wholesaler/Seller)
router.post('/', auth, requireRole('wholesaler'), [
  body('amount').isFloat({ min: 0.01 }),
  body('bankAccount').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, bankAccount } = req.body;

    // Get available balance
    const transactions = await Transaction.find({
      wholesaler: req.user._id,
      status: 'completed',
      availableForWithdrawalAt: { $lte: new Date() }
    });

    const availableAmount = transactions.reduce((sum, txn) => {
      const withdrawn = txn.metadata?.withdrawn || false;
      return withdrawn ? sum : sum + txn.amount;
    }, 0);

    if (amount > availableAmount) {
      return res.status(400).json({ error: 'Insufficient funds available for withdrawal' });
    }

    // Mark transactions as withdrawn (in a real system, you'd process actual withdrawal)
    let remaining = amount;
    for (const txn of transactions) {
      if (remaining <= 0) break;
      
      // Check if already withdrawn
      const withdrawn = txn.metadata?.get?.('withdrawn') || txn.metadata?.withdrawn;
      if (withdrawn) continue;

      const txnAmount = Math.min(remaining, txn.amount);
      
      // Handle metadata (can be Map or plain object)
      if (!txn.metadata) {
        txn.metadata = new Map();
      }
      if (txn.metadata instanceof Map) {
        txn.metadata.set('withdrawn', 'true');
        txn.metadata.set('withdrawnAmount', txnAmount.toString());
        txn.metadata.set('withdrawnAt', new Date().toISOString());
      } else {
        txn.metadata = new Map(Object.entries(txn.metadata || {}));
        txn.metadata.set('withdrawn', 'true');
        txn.metadata.set('withdrawnAmount', txnAmount.toString());
        txn.metadata.set('withdrawnAt', new Date().toISOString());
      }
      
      await txn.save();

      remaining -= txnAmount;

      // Create ledger entry
      const ledgerEntry = new Ledger({
        transactionId: txn.transactionId,
        type: 'withdrawal',
        amount: txnAmount,
        from: `seller-${req.user._id}`,
        to: 'external',
        balance: availableAmount - (amount - remaining),
        description: `Withdrawal to ${bankAccount || 'bank account'}`,
        merchantAccountId: process.env.MERCHANT_ACCOUNT_ID || 'default-merchant',
        metadata: {
          sellerId: req.user._id.toString(),
          bankAccount: bankAccount || 'N/A'
        }
      });

      await ledgerEntry.save();
    }

    res.json({
      success: true,
      amount,
      message: 'Withdrawal request processed successfully',
      availableBalance: availableAmount - amount
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Server error processing withdrawal' });
  }
});

module.exports = router;

