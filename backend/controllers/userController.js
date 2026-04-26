const User = require('../models/User');
const { createClerkClient } = require('@clerk/clerk-sdk-node');

const secretKey = process.env.CLERK_SECRET_KEY || '';
let clerkClient = null;
if (secretKey && !secretKey.includes('REPLACE')) {
    clerkClient = createClerkClient({ secretKey });
}

/**
 * @desc    Get all users in the current organization
 * @route   GET /api/users
 * @access  Private
 */
const getAllUsers = async (req, res) => {
  try {
    const orgId = req.orgId;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: 'A workspace must be active to fetch users.',
      });
    }

    if (!clerkClient) {
      return res.status(500).json({
        success: false,
        message: 'Clerk configuration missing.',
      });
    }

    // 1. Fetch memberships from Clerk
    const memberships = await clerkClient.organizations.getOrganizationMembershipList({ 
      organizationId: orgId 
    });

    const clerkUserIds = memberships.map(m => m.publicUserData.userId);

    // 2. Find those users in our DB
    const users = await User.find({ 
      clerkId: { $in: clerkUserIds } 
    }).select('name email role clerkId').sort({ name: 1 });

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
      message: 'Server error while fetching organization members.',
    });
  }
};

module.exports = { getAllUsers };
