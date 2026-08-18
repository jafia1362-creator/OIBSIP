const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  loginUser,
  adminLogin,
  googleAuth,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateUserRole,
  toggleUserVerification,
  deleteUser,
  createUserByAdmin,
  updateUser,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/admin/login', adminLogin);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Admin User Management Routes
router.get('/admin/users', protect, admin, getAllUsers);
router.post('/admin/users', protect, admin, createUserByAdmin);
router.put('/admin/users/:userId', protect, admin, updateUser);
router.put('/admin/users/:userId/role', protect, admin, updateUserRole);
router.put('/admin/users/:userId/verify', protect, admin, toggleUserVerification);
router.delete('/admin/users/:userId', protect, admin, deleteUser);

module.exports = router;

