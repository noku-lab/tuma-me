const { auth, requireRole } = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const mongoose = require('mongoose');

// Mock User model
jest.mock('../../models/User');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('auth middleware', () => {
    test('should return 401 if no token provided', async () => {
      req.header = jest.fn().mockReturnValue(undefined);

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided, authorization denied' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if token is invalid', async () => {
      req.header = jest.fn().mockReturnValue('Bearer invalid-token');

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token is not valid' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if user not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);
      req.header = jest.fn().mockReturnValue(`Bearer ${token}`);
      User.findById.mockResolvedValue(null);

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token is not valid' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should set req.user and call next on valid token', async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);
      const mockUser = { _id: userId, email: 'test@example.com', role: 'retailer' };
      
      // Mock the header method to return Authorization header
      req.header = jest.fn((headerName) => {
        if (headerName === 'Authorization') {
          return `Bearer ${token}`;
        }
        return undefined;
      });
      
      // Mock User.findById().select() chain
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await auth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(userId.toString());
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should handle token without Bearer prefix', async () => {
      req.header = jest.fn().mockReturnValue('invalid-format');

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole middleware', () => {
    test('should return 401 if user not authenticated', () => {
      req.user = undefined;
      const middleware = requireRole('retailer');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 if user role not allowed', () => {
      req.user = { role: 'retailer' };
      const middleware = requireRole('admin', 'wholesaler');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should call next if user has required role', () => {
      req.user = { role: 'admin' };
      const middleware = requireRole('admin', 'wholesaler');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow multiple roles', () => {
      req.user = { role: 'wholesaler' };
      const middleware = requireRole('admin', 'wholesaler', 'retailer');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
