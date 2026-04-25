const User = require('../models/User');

// @desc    Get all users (for admin task assignment picker)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role').sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully.',
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Get All Users Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users.',
    });
  }
};

module.exports = { getAllUsers };
