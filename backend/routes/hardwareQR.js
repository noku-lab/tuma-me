const express = require('express');
const { body, validationResult } = require('express-validator');
const HardwareQRGenerator = require('../models/HardwareQRGenerator');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/hardware-qr/register
// @desc    Register a hardware QR code generator
// @access  Private (Wholesaler/Admin)
router.post('/register', auth, requireRole('wholesaler', 'admin'), [
  body('deviceId').trim().notEmpty(),
  body('serialNumber').trim().notEmpty(),
  body('name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId, serialNumber, name } = req.body;

    // Check if device already exists
    const existing = await HardwareQRGenerator.findOne({
      $or: [
        { deviceId },
        { serialNumber }
      ]
    });

    if (existing) {
      return res.status(400).json({ error: 'Device already registered' });
    }

    const generator = new HardwareQRGenerator({
      deviceId,
      serialNumber,
      name,
      registeredBy: req.user._id,
      assignedTo: req.user.role === 'wholesaler' ? req.user._id : undefined
    });

    await generator.save();

    res.status(201).json(generator);
  } catch (error) {
    console.error('Register hardware QR error:', error);
    res.status(500).json({ error: 'Server error registering hardware QR generator' });
  }
});

// @route   GET /api/hardware-qr
// @desc    Get registered hardware QR generators
// @access  Private (Wholesaler/Admin)
router.get('/', auth, requireRole('wholesaler', 'admin'), async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'wholesaler') {
      query.$or = [
        { registeredBy: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    const generators = await HardwareQRGenerator.find(query)
      .populate('registeredBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(generators);
  } catch (error) {
    console.error('Get hardware QR error:', error);
    res.status(500).json({ error: 'Server error fetching hardware QR generators' });
  }
});

// @route   PUT /api/hardware-qr/:id/assign
// @desc    Assign hardware to a user
// @access  Private (Wholesaler/Admin)
router.put('/:id/assign', auth, requireRole('wholesaler', 'admin'), [
  body('userId').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const generator = await HardwareQRGenerator.findById(req.params.id);

    if (!generator) {
      return res.status(404).json({ error: 'Hardware QR generator not found' });
    }

    // Check authorization
    if (req.user.role === 'wholesaler' && 
        generator.registeredBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    generator.assignedTo = req.body.userId;
    await generator.save();

    res.json(generator);
  } catch (error) {
    console.error('Assign hardware QR error:', error);
    res.status(500).json({ error: 'Server error assigning hardware QR generator' });
  }
});

module.exports = router;

