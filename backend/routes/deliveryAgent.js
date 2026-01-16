const express = require('express');
const Transaction = require('../models/Transaction');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/delivery-agent/assigned-orders
// @desc    Get assigned orders for delivery agent
// @access  Private (Delivery Agent)
router.get('/assigned-orders', auth, requireRole('delivery_agent'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = {
      deliveryAgent: req.user._id
    };

    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .populate('retailer', 'name email phone')
      .populate('wholesaler', 'name email')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get assigned orders error:', error);
    res.status(500).json({ error: 'Server error fetching assigned orders' });
  }
});

// @route   GET /api/delivery-agent/order/:id
// @desc    Get order details with retailer contact info
// @access  Private (Delivery Agent)
router.get('/order/:id', auth, requireRole('delivery_agent'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('retailer', 'name email phone')
      .populate('wholesaler', 'name email')
      .populate('deliveryAgent', 'name email phone');

    if (!transaction) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if assigned to this agent
    if (transaction.deliveryAgent._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Return order with retailer contact and delivery address
    res.json({
      transactionId: transaction.transactionId,
      retailer: {
        name: transaction.retailer.name,
        email: transaction.retailer.email,
        phone: transaction.retailer.phone
      },
      deliveryAddress: transaction.deliveryAddress,
      description: transaction.description,
      amount: transaction.amount,
      status: transaction.status,
      qrCode: transaction.qrCode ? {
        code: transaction.qrCode.code,
        expiresAt: transaction.qrCode.expiresAt
      } : null
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Server error fetching order details' });
  }
});

module.exports = router;

