const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // First user is admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Auth with Clerk
// @route   POST /api/auth/clerk
// @access  Public
const clerkLogin = async (req, res) => {
  try {
    const { token, clerkUser } = req.body;

    if (!token || !clerkUser) {
      return res.status(400).json({
        success: false,
        message: 'Clerk token and user info are required.',
      });
    }

    // Extract email robustly (Mobile sends as string, Backend logic expects object)
    let email = null;
    if (typeof clerkUser.primaryEmailAddress === 'string') {
      email = clerkUser.primaryEmailAddress;
    } else if (clerkUser.primaryEmailAddress?.emailAddress) {
      email = clerkUser.primaryEmailAddress.emailAddress;
    } else if (clerkUser.email || clerkUser.emailAddress) {
      email = clerkUser.email || clerkUser.emailAddress;
    }

    if (!email && Array.isArray(clerkUser.emailAddresses)) {
      email = clerkUser.emailAddresses[0]?.emailAddress;
    }

    // Extract name
    const name = clerkUser.fullName || 
                (clerkUser.firstName && clerkUser.lastName ? `${clerkUser.firstName} ${clerkUser.lastName}` : null) ||
                clerkUser.firstName || 
                clerkUser.username || 
                'New User';

    // Find or create user locally
    // 1. Check by clerkId
    let user = await User.findOne({ clerkId: clerkUser.id });

    // 2. Fallback: Check by email (to link seeded or pre-existing users)
    if (!user && email) {
      user = await User.findOne({ email });
      
      if (user) {
        // Link the existing user with the new Clerk ID
        user.clerkId = clerkUser.id;
        await user.save();
        console.log(`Linked existing user ${email} with Clerk ID ${clerkUser.id}`);
      }
    }

    if (!user) {
      // Check if this is the first user
      const userCount = await User.countDocuments();
      const role = userCount === 0 ? 'admin' : 'user';

      // Create new user using info from Clerk
      user = await User.create({
        clerkId: clerkUser.id,
        name: name,
        email: email,
        role: role,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Clerk authentication successful.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          clerkId: user.clerkId,
        },
      },
    });
  } catch (error) {
    console.error('Clerk Login Error [Detail]:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: `Server error during Clerk login: ${error.message}`,
    });
  }
};

module.exports = { signup, login, clerkLogin };
