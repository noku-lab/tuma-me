const express = require('express');
const QRCode = require('qrcode');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/qr/:transactionId
// @desc    Get QR code for a transaction (wholesaler/delivery agent only)
// @access  Private (Wholesaler/Delivery Agent)
router.get('/:transactionId', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Only wholesaler, delivery agent, or admin can get QR code
    const isWholesaler = transaction.wholesaler.toString() === req.user._id.toString();
    const isDeliveryAgent = transaction.deliveryAgent && 
      transaction.deliveryAgent.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isWholesaler && !isDeliveryAgent && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!transaction.qrCode || !transaction.qrCode.code) {
      return res.status(400).json({ error: 'QR code not generated yet' });
    }

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(transaction.qrCode.code);

    res.json({
      qrCodeImage,
      qrCodeString: transaction.qrCode.code,
      expiresAt: transaction.qrCode.expiresAt,
      scanned: !!transaction.qrCode.scannedAt
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ error: 'Server error generating QR code' });
  }
});

module.exports = router;

