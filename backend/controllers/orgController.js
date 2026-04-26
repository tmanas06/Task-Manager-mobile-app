const Organization = require('../models/Organization');
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const crypto = require('crypto');

const secretKey = process.env.CLERK_SECRET_KEY;
const clerkClient = createClerkClient({ secretKey });

// @desc    Get or Create local organization record and return join code
// @route   POST /api/orgs/sync
const syncOrganization = async (req, res) => {
  try {
    const { clerkOrgId, name } = req.body;

    if (!clerkOrgId) {
      return res.status(400).json({ success: false, message: 'clerkOrgId is required' });
    }

    let org = await Organization.findOne({ clerkOrgId });

    if (!org) {
      // Generate a unique join code
      const joinCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. "A1B2C3D4"
      org = await Organization.create({
        clerkOrgId,
        name,
        joinCode,
        createdBy: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      data: org,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join an organization using a join code
// @route   POST /api/orgs/join
const joinByCode = async (req, res) => {
  try {
    const { joinCode } = req.body;

    if (!joinCode) {
      return res.status(400).json({ success: false, message: 'Join code is required' });
    }

    const org = await Organization.findOne({ joinCode: joinCode.toUpperCase() });

    if (!org) {
      return res.status(404).json({ success: false, message: 'Invalid join code' });
    }

    // Add user to Clerk Organization
    try {
      await clerkClient.organizations.createOrganizationMembership({
        organizationId: org.clerkOrgId,
        userId: req.user.clerkId,
        role: 'org:member',
      });
    } catch (clerkError) {
      // If user is already a member, Clerk will throw 422 - usually safe to ignore
      if (clerkError.status !== 422) {
        throw clerkError;
      }
    }

    res.status(200).json({
      success: true,
      data: org,
      message: `Successfully joined ${org.name}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a member's role in the organization
// @route   PATCH /api/orgs/members/:userId/role
const updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body; // e.g. 'org:admin' or 'org:member'
    const orgId = req.orgId;

    if (!orgId) {
        return res.status(400).json({ success: false, message: 'No active workspace found' });
    }

    if (!['org:admin', 'org:member'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // 1. Verify that the requester is an admin in this org
    const requesterMembership = await clerkClient.organizations.getOrganizationMembershipList({ 
        organizationId: orgId 
    });
    const requester = requesterMembership.find(m => m.publicUserData.userId === req.user.clerkId);
    
    if (!requester || requester.role !== 'org:admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized. Only admins can change roles.' });
    }

    // 2. Update the role via Clerk
    const membership = await clerkClient.organizations.updateOrganizationMembership({
        organizationId: orgId,
        userId: userId,
        role: role,
    });

    res.status(200).json({
        success: true,
        message: 'Member role updated successfully',
        data: membership,
    });
  } catch (error) {
    console.error('Update Role Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  syncOrganization,
  joinByCode,
  updateMemberRole,
};
