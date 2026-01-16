const express = require('express');
const Transaction = require('../models/Transaction');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/payouts/pending
// @desc    Get pending payouts for wholesaler
// @access  Private (Wholesaler)
router.get('/pending', auth, requireRole('wholesaler'), async (req, res) => {
  try {
    const transactions = await Transaction.find({
      wholesaler: req.user._id,
      status: { $in: ['funded', 'in_transit', 'on_hold', 'delivered'] }
    })
      .populate('retailer', 'name email phone')
      .sort({ createdAt: -1 });

    const pendingPayouts = transactions.map(txn => ({
      transactionId: txn.transactionId,
      amount: txn.amount,
      currency: txn.currency,
      retailer: txn.retailer,
      status: txn.status,
      createdAt: txn.createdAt,
      holdReleaseAt: txn.holdReleaseAt,
      availableForWithdrawalAt: txn.availableForWithdrawalAt,
      description: txn.description
    }));

    const totalPending = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0);

    res.json({
      payouts: pendingPayouts,
      totalPending,
      count: pendingPayouts.length
    });
  } catch (error) {
    console.error('Get pending payouts error:', error);
    res.status(500).json({ error: 'Server error fetching pending payouts' });
  }
});

// @route   GET /api/payouts/summary
// @desc    Get payout summary for wholesaler
// @access  Private (Wholesaler)
router.get('/summary', auth, requireRole('wholesaler'), async (req, res) => {
  try {
    const pending = await Transaction.find({
      wholesaler: req.user._id,
      status: { $in: ['funded', 'in_transit', 'on_hold', 'delivered'] }
    });

    const completed = await Transaction.find({
      wholesaler: req.user._id,
      status: 'completed',
      availableForWithdrawalAt: { $lte: new Date() }
    });

    const withdrawn = await Transaction.find({
      wholesaler: req.user._id,
      status: 'completed',
      'metadata.withdrawn': { $exists: true }
    });

    const totalPending = pending.reduce((sum, txn) => sum + txn.amount, 0);
    const totalAvailable = completed.reduce((sum, txn) => {
      const withdrawn = txn.metadata?.get?.('withdrawn') || txn.metadata?.withdrawn;
      return withdrawn ? sum : sum + txn.amount;
    }, 0);
    const totalWithdrawn = withdrawn.reduce((sum, txn) => {
      const amount = parseFloat(txn.metadata?.get?.('withdrawnAmount') || txn.metadata?.withdrawnAmount || txn.amount);
      return sum + amount;
    }, 0);

    res.json({
      pending: {
        amount: totalPending,
        count: pending.length
      },
      available: {
        amount: totalAvailable,
        count: completed.length
      },
      withdrawn: {
        amount: totalWithdrawn,
        count: withdrawn.length
      }
    });
  } catch (error) {
    console.error('Get payout summary error:', error);
    res.status(500).json({ error: 'Server error fetching payout summary' });
  }
});

module.exports = router;

