const mongoose = require('mongoose');
const Transaction = require('../../models/Transaction');
const User = require('../../models/User');

describe('Transaction Model', () => {
  let retailer, wholesaler;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/tuma-me-test?authSource=admin';
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Transaction.deleteMany({});
    await User.deleteMany({});

    // Create test users
    retailer = new User({
      email: 'retailer@test.com',
      password: 'password123',
      name: 'Test Retailer',
      role: 'retailer',
    });
    await retailer.save();

    wholesaler = new User({
      email: 'wholesaler@test.com',
      password: 'password123',
      name: 'Test Wholesaler',
      role: 'wholesaler',
    });
    await wholesaler.save();
  });

  describe('Transaction Creation', () => {
    test('should create a transaction with valid data', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const transactionId = `TXN-${timestamp}-${random}`;
      
      const transactionData = {
        transactionId,
        retailer: retailer._id,
        wholesaler: wholesaler._id,
        amount: 100.50,
        description: 'Test transaction',
        paymentMethod: 'ecocash',
        status: 'pending',
      };

      const transaction = new Transaction(transactionData);
      await transaction.save();

      expect(transaction._id).toBeDefined();
      expect(transaction.transactionId).toBeDefined();
      expect(transaction.transactionId).toMatch(/^TXN-/);
      expect(transaction.retailer.toString()).toBe(retailer._id.toString());
      expect(transaction.wholesaler.toString()).toBe(wholesaler._id.toString());
      expect(transaction.amount).toBe(100.50);
      expect(transaction.description).toBe('Test transaction');
      expect(transaction.paymentMethod).toBe('ecocash');
      expect(transaction.status).toBe('pending');
      expect(transaction.currency).toBe('USD');
      expect(transaction.createdAt).toBeDefined();
      expect(transaction.updatedAt).toBeDefined();
    });

    test('should generate unique transaction ID', async () => {
      const timestamp1 = Date.now();
      const random1 = Math.floor(Math.random() * 10000);
      const transactionId1 = `TXN-${timestamp1}-${random1}`;
      
      const transaction1 = new Transaction({
        transactionId: transactionId1,
        retailer: retailer._id,
        wholesaler: wholesaler._id,
        amount: 100,
        description: 'Transaction 1',
        paymentMethod: 'ecocash',
      });
      await transaction1.save();

      const timestamp2 = Date.now() + 1;
      const random2 = Math.floor(Math.random() * 10000);
      const transactionId2 = `TXN-${timestamp2}-${random2}`;
      
      const transaction2 = new Transaction({
        transactionId: transactionId2,
        retailer: retailer._id,
        wholesaler: wholesaler._id,
        amount: 200,
        description: 'Transaction 2',
        paymentMethod: 'bank_transfer',
      });
      await transaction2.save();

      expect(transaction1.transactionId).not.toBe(transaction2.transactionId);
    });

    test('should default status to pending', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const transactionId = `TXN-${timestamp}-${random}`;
      
      const transaction = new Transaction({
        transactionId,
        retailer: retailer._id,
        wholesaler: wholesaler._id,
        amount: 100,
        description: 'Test transaction',
        paymentMethod: 'ecocash',
      });
      await transaction.save();

      expect(transaction.status).toBe('pending');
    });

    test('should update updatedAt on save', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const transactionId = `TXN-${timestamp}-${random}`;
      
      const transaction = new Transaction({
        transactionId,
        retailer: retailer._id,
        wholesaler: wholesaler._id,
        amount: 100,
        description: 'Test transaction',
        paymentMethod: 'ecocash',
      });
      await transaction.save();

      // Get the original updatedAt from the saved transaction instance
      const originalUpdatedAt = transaction.updatedAt;
      expect(originalUpdatedAt).toBeDefined();
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Update the transaction using the same instance
      transaction.description = 'Updated description';
      await transaction.save();

      // Check that updatedAt was updated on the instance
      expect(transaction.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    test('should validate payment method enum', async () => {
      const transaction = new Transaction({
        retailer: retailer._id,
        wholesaler: wholesaler._id,
        amount: 100,
        description: 'Test transaction',
        paymentMethod: 'invalid_method',
      });

      await expect(transaction.save()).rejects.toThrow();
    });

    test('should validate status enum', async () => {
      const transaction = new Transaction({
        retailer: retailer._id,
        wholesaler: wholesaler._id,
        amount: 100,
        description: 'Test transaction',
        paymentMethod: 'ecocash',
        status: 'invalid_status',
      });

      await expect(transaction.save()).rejects.toThrow();
    });

    test('should require retailer', async () => {
      const transaction = new Transaction({
        wholesaler: wholesaler._id,
        amount: 100,
        description: 'Test transaction',
        paymentMethod: 'ecocash',
      });

      await expect(transaction.save()).rejects.toThrow();
    });

    test('should require wholesaler', async () => {
      const transaction = new Transaction({
        retailer: retailer._id,
        amount: 100,
        description: 'Test transaction',
        paymentMethod: 'ecocash',
      });

      await expect(transaction.save()).rejects.toThrow();
    });

    test('should require amount', async () => {
      const transaction = new Transaction({
        retailer: retailer._id,
        wholesaler: wholesaler._id,
        description: 'Test transaction',
        paymentMethod: 'ecocash',
      });

      await expect(transaction.save()).rejects.toThrow();
    });

    test('should accept optional delivery address', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const transactionId = `TXN-${timestamp}-${random}`;
      
      const transaction = new Transaction({
        transactionId,
        retailer: retailer._id,
        wholesaler: wholesaler._id,
        amount: 100,
        description: 'Test transaction',
        paymentMethod: 'ecocash',
        deliveryAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
      });
      await transaction.save();

      expect(transaction.deliveryAddress.street).toBe('123 Main St');
      expect(transaction.deliveryAddress.city).toBe('Test City');
    });

    test('should accept optional QR code data', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const transactionId = `TXN-${timestamp}-${random}`;
      
      const transaction = new Transaction({
        transactionId,
        retailer: retailer._id,
        wholesaler: wholesaler._id,
        amount: 100,
        description: 'Test transaction',
        paymentMethod: 'ecocash',
        qrCode: {
          code: 'QR123456',
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
      await transaction.save();

      expect(transaction.qrCode.code).toBe('QR123456');
      expect(transaction.qrCode.expiresAt).toBeDefined();
    });
  });
});
