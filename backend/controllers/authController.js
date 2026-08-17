const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecret_pizza_jwt_key_2026', {
    expiresIn: '7d',
  });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      password, // hashed automatically by userSchema pre-save hook
      role: 'user',
      isVerified: true,
      verificationToken,
      verificationTokenExpires,
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

    // Send email asynchronously without blocking registration flow
    sendEmail({
      to: email,
      subject: 'Verify Your Pizza Delivery Account Email',
      html: `
        <h3>Welcome to SliceCraft Pizza, ${name}!</h3>
        <p>Click below to verify your email address:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
      `,
      text: `Verify your email: ${verifyUrl}`,
    }).catch((e) => console.warn('Email notification skipped/failed:', e.message));

    res.status(201).json({
      message: 'Registration successful! Your account is active and verified.',
      verificationToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification token is invalid or has expired.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Auto-verify account upon valid password entry if not already verified
    if (!user.isVerified) {
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      token: generateToken(user._id, user.role || 'user'),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: 'admin',
      token: generateToken(user._id, 'admin'),
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'Reset Password - SliceCraft Pizza',
      html: `
        <h3>Reset Password Request</h3>
        <p>You requested a password reset. Please use the link below to set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
      text: `Reset password URL: ${resetUrl}`,
    });

    res.status(200).json({
      message: 'Password reset link sent to your email.',
      resetToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    user.password = password; // hashes automatically on pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful! You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Registered Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update User Role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: `User role updated to ${role} successfully`, user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Toggle User Verification
const toggleUserVerification = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.json({
      message: `User verification status updated to ${user.isVerified ? 'Verified' : 'Pending'}`,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error('Toggle user verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete User (with Cascading Orders Deletion)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (String(req.user._id) === String(userId)) {
      return res.status(400).json({ message: 'You cannot delete your own admin account!' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email === 'admin@pizzadelivery.com') {
      return res.status(400).json({ message: 'Primary Super Admin account is protected and cannot be deleted!' });
    }

    // Professional Cascading Delete: Clean up all orders associated with this user
    const orderDeleteResult = await Order.deleteMany({
      $or: [
        { user: userId },
        { customerEmail: user.email.toLowerCase() },
      ],
    });

    // Delete user account from MongoDB
    await User.findByIdAndDelete(userId);

    res.json({
      message: `User "${user.name}" (${user.email}) and ${orderDeleteResult.deletedCount || 0} associated orders deleted successfully!`,
      deletedOrdersCount: orderDeleteResult.deletedCount || 0,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Edit / Update User
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, role, isVerified, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists && String(emailExists._id) !== String(userId)) {
        return res.status(400).json({ message: 'Another user already exists with this email' });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role && ['admin', 'user'].includes(role)) {
      if (role === 'user') {
        if (String(userId) === String(req.user._id)) {
          return res.status(400).json({ message: 'Security Warning: You cannot demote your own active Admin account!' });
        }
        if (user.email === 'admin@pizzadelivery.com') {
          return res.status(400).json({ message: 'Primary Super Admin role is protected and cannot be demoted!' });
        }
      }
      user.role = role;
    }
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (password && password.trim() !== '') user.password = password;

    await user.save();

    res.json({ message: `User "${user.name}" updated successfully`, user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Create User
const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, role, isVerified } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: role || 'user',
      isVerified: typeof isVerified === 'boolean' ? isVerified : true,
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  adminLogin,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateUserRole,
  toggleUserVerification,
  deleteUser,
  createUserByAdmin,
  updateUser,
};
