const { createClerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

// Initialize Clerk with fallback to prevent crash on startup
const secretKey = process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes('REPLACE') 
  ? process.env.CLERK_SECRET_KEY 
  : '';

let clerkClient = null;
if (secretKey) {
    try {
        clerkClient = createClerkClient({ secretKey });
    } catch (e) {
        console.error('Failed to initialize Clerk Client:', e.message);
    }
}

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!clerkClient) {
        return res.status(500).json({ 
          message: 'Auth Service unavailable (Missing CLERK_SECRET_KEY)' 
        });
      }

      const sessionClaims = await clerkClient.verifyToken(token);
      
      if (!sessionClaims) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }

      let user = await User.findOne({ clerkId: sessionClaims.sub });

      if (!user) {
        return res.status(401).json({ message: 'User not found in local database' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Clerk Auth Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
