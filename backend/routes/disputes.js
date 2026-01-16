const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/disputes/:transactionId
// @desc    File a dispute for a transaction
// @access  Private (Retailer/Buyer)
router.post('/:transactionId', auth, [
  body('reason').trim().notEmpty().withMessage('Dispute reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.findById(req.params.transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Only retailer can file dispute
    if (transaction.retailer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the retailer can file a dispute' });
    }

    // Can only dispute if in transit, delivered, or on_hold
    if (!['in_transit', 'delivered', 'on_hold'].includes(transaction.status)) {
      return res.status(400).json({ error: 'Transaction cannot be disputed in current state' });
    }

    if (transaction.dispute && transaction.dispute.filedAt) {
      return res.status(400).json({ error: 'Dispute already filed for this transaction' });
    }

    // Update transaction
    transaction.status = 'disputed';
    transaction.dispute = {
      reason: req.body.reason,
      filedAt: new Date(),
      filedBy: req.user._id
    };

    // If funds were on hold, keep them on hold
    if (transaction.status === 'on_hold') {
      // Funds remain in escrow
    }

    await transaction.save();

    // Create ledger entry
    const ledgerEntry = new Ledger({
      transactionId: transaction.transactionId,
      type: 'hold',
      amount: transaction.amount,
      from: 'escrow',
      to: 'escrow',
      balance: transaction.amount,
      description: `Dispute filed: ${req.body.reason}`,
      merchantAccountId: process.env.MERCHANT_ACCOUNT_ID || 'default-merchant',
      metadata: {
        disputeReason: req.body.reason,
        filedBy: req.user._id.toString()
      }
    });

    await ledgerEntry.save();

    res.json({
      transaction,
      message: 'Dispute filed successfully. Funds are held until resolution.'
    });
  } catch (error) {
    console.error('File dispute error:', error);
    res.status(500).json({ error: 'Server error filing dispute' });
  }
});

// @route   GET /api/disputes/:transactionId
// @desc    Get dispute details
// @access  Private
router.get('/:transactionId', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('dispute.filedBy', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check authorization
    const isRetailer = transaction.retailer.toString() === req.user._id.toString();
    const isWholesaler = transaction.wholesaler.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRetailer && !isWholesaler && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      dispute: transaction.dispute,
      transactionId: transaction.transactionId,
      status: transaction.status
    });
  } catch (error) {
    console.error('Get dispute error:', error);
    res.status(500).json({ error: 'Server error fetching dispute' });
  }
});

module.exports = router;

