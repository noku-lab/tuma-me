// Jest setup file for backend tests
const mongoose = require('mongoose');

// Increase timeout for database operations
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Only close if connection is open
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
    } catch (error) {
      // Ignore errors when closing connection
    }
  }
});
