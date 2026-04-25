const express = require('express');
const { protect: verifyToken } = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { getAllUsers } = require('../controllers/userController');

const router = express.Router();

// All user routes require authentication
router.use(verifyToken);

// @route   GET /api/users
// @desc    Get all users (admin only — for assignment picker)
router.get('/', requireRole('admin'), getAllUsers);

module.exports = router;
