const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getAdminAnalytics,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/razorpay-order', protect, createRazorpayOrder);
router.post('/place-order', protect, placeOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/admin/all-orders', protect, admin, getAllOrders);
router.put('/admin/status/:id', protect, admin, updateOrderStatus);
router.get('/admin/analytics', protect, admin, getAdminAnalytics);

module.exports = router;

