const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const mongoose = require('mongoose');

// Job to automatically release funds after 12hr hold period
async function releaseHeldFunds() {
  try {
    // Check if MongoDB is connected before running queries
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, skipping background job');
      return { released: 0, skipped: true };
    }
    
    const now = new Date();
    
    // Find transactions that are on hold and past the hold release time
    const transactions = await Transaction.find({
      status: 'on_hold',
      holdReleaseAt: { $lte: now }
    }).populate('wholesaler');

    for (const transaction of transactions) {
      // Check if there's a dispute
      if (transaction.dispute && transaction.dispute.filedAt) {
        // Skip if dispute is filed - funds remain held
        continue;
      }

      // Ensure wholesaler is populated
      if (!transaction.wholesaler || !transaction.wholesaler._id) {
        console.log(`Skipping transaction ${transaction.transactionId} - wholesaler not found`);
        continue;
      }

      // Release funds to wholesaler
      // Generate entryId manually to satisfy required validation
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const entryId = `LEDGER-${timestamp}-${random}`;
      
      const releaseLedger = new Ledger({
        entryId,
        transactionId: transaction.transactionId,
        type: 'release',
        amount: transaction.amount,
        from: 'escrow',
        to: `wholesaler-${transaction.wholesaler._id}`,
        balance: 0,
        description: `Funds released to wholesaler after 12hr hold period for transaction ${transaction.transactionId}`,
        merchantAccountId: process.env.MERCHANT_ACCOUNT_ID || 'default-merchant'
      });

      await releaseLedger.save();

      // Complete transaction
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      await transaction.save();

      console.log(`Released funds for transaction ${transaction.transactionId}`);
    }

    return { released: transactions.length };
  } catch (error) {
    console.error('Error releasing held funds:', error);
    throw error;
  }
}

// Run every 5 minutes
if (require.main === module) {
  setInterval(async () => {
    await releaseHeldFunds();
  }, 5 * 60 * 1000); // 5 minutes

  // Run immediately
  releaseHeldFunds();
}

module.exports = { releaseHeldFunds };

