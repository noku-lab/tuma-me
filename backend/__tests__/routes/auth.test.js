const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../../routes/auth');
const User = require('../../models/User');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Set JWT secret for testing
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '7d';

describe('Auth Routes', () => {
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
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'retailer',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.name).toBe('New User');
      expect(response.body.user.role).toBe('retailer');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should default role to retailer if not provided', async () => {
      const userData = {
        email: 'defaultrole@example.com',
        password: 'password123',
        name: 'Default Role User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.role).toBe('retailer');
    });

    test('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should return 400 for short password', async () => {
      const userData = {
        email: 'shortpass@example.com',
        password: '12345',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should return 400 for missing name', async () => {
      const userData = {
        email: 'noname@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should return 400 if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register again
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User already exists');
    });

    test('should accept optional phone field', async () => {
      const userData = {
        email: 'withphone@example.com',
        password: 'password123',
        name: 'Phone User',
        phone: '+1234567890',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user - password will be hashed by pre-save hook
      const user = new User({
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User',
        role: 'retailer',
      });
      await user.save();
      
      // Verify user was created and password is hashed
      const savedUser = await User.findOne({ email: 'login@example.com' });
      expect(savedUser).toBeTruthy();
      expect(savedUser.password).not.toBe('password123');
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('login@example.com');
    });

    test('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should return 400 for invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('should return 400 for missing password', async () => {
      const loginData = {
        email: 'login@example.com',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });
});
