const mongoose = require('mongoose');

const hardwareQRGeneratorSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'lost', 'damaged'],
    default: 'active'
  },
  lastUsedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
// Note: deviceId and serialNumber already have unique indexes from unique: true
hardwareQRGeneratorSchema.index({ registeredBy: 1 });
hardwareQRGeneratorSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('HardwareQRGenerator', hardwareQRGeneratorSchema);

