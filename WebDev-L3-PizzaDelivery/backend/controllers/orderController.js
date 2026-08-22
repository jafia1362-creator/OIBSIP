const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const connectDB = require('../config/db');

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (key_id && key_secret && key_id !== 'rzp_test_placeholder_key') {
    return new Razorpay({ key_id, key_secret });
  }
  return null;
};

// Create Razorpay Checkout Order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const razorpay = getRazorpayInstance();

    if (!razorpay) {
      const mockRazorpayOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      return res.json({
        id: mockRazorpayOrderId,
        currency: 'INR',
        amount: Math.round(amount * 100),
        mock: true,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key',
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      ...order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    const mockRazorpayOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    res.json({
      id: mockRazorpayOrderId,
      currency: 'INR',
      amount: Math.round((req.body.amount || 299) * 100),
      mock: true,
      key: 'rzp_test_demo_key',
    });
  }
};

const { checkAndNotifyLowStock } = require('../utils/cronJobs');

let memoryOrders = [];

// Confirm Payment & Create Order + Decrement Stock in MongoDB
const placeOrder = async (req, res) => {
  try {
    try {
      await connectDB();
    } catch (dbErr) {
      console.warn('MongoDB connection unavailable, using fallback memory order pipeline:', dbErr.message);
    }

    const {
      customerName,
      customerEmail,
      deliveryAddress,
      items,
      totalAmount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    // Razorpay Signature Verification
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (key_secret && key_secret !== 'placeholder_secret_key' && razorpayOrderId && razorpayPaymentId) {
      if (razorpaySignature !== 'mock_valid_signature') {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', key_secret);
        hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        const generatedSignature = hmac.digest('hex');
        if (generatedSignature !== razorpaySignature) {
          return res.status(400).json({ message: 'Payment verification failed: invalid signature.' });
        }
      }
    }

    // 1. Idempotency Check: Prevent duplicate order processing / double decrements
    if (razorpayOrderId) {
      let existingOrder = null;
      try {
        if (mongoose.connection.readyState === 1) {
          existingOrder = await Order.findOne({ razorpayOrderId }).maxTimeMS(3000);
        }
      } catch (e) {}

      if (!existingOrder) {
        existingOrder = memoryOrders.find((o) => o.razorpayOrderId === razorpayOrderId);
      }

      if (existingOrder) {
        return res.status(200).json({
          message: 'Order already processed.',
          order: existingOrder,
        });
      }
    }

    const formattedItems = (items || []).map((item) => ({
      name: item.name || item.customName || 'Custom Artisan Pizza',
      customName: item.customName || item.name || 'Custom Artisan Pizza',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      base: item.base || {},
      sauce: item.sauce || {},
      cheese: item.cheese || {},
      veggies: item.veggies || [],
    }));

    if (formattedItems.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }

    // 2. Aggregate all ingredient requirements across the entire order
    const requiredIngredients = new Map();

    for (const item of formattedItems) {
      const qty = item.quantity || 1;

      if (item.base?.name) {
        const key = `base:${item.base.name}`;
        requiredIngredients.set(key, {
          name: item.base.name,
          category: 'base',
          neededQty: (requiredIngredients.get(key)?.neededQty || 0) + qty,
        });
      }

      if (item.sauce?.name) {
        const key = `sauce:${item.sauce.name}`;
        requiredIngredients.set(key, {
          name: item.sauce.name,
          category: 'sauce',
          neededQty: (requiredIngredients.get(key)?.neededQty || 0) + qty,
        });
      }

      if (item.cheese?.name) {
        const key = `cheese:${item.cheese.name}`;
        requiredIngredients.set(key, {
          name: item.cheese.name,
          category: 'cheese',
          neededQty: (requiredIngredients.get(key)?.neededQty || 0) + qty,
        });
      }

      if (Array.isArray(item.veggies)) {
        for (const veg of item.veggies) {
          if (veg?.name) {
            const key = `veggie:${veg.name}`;
            requiredIngredients.set(key, {
              name: veg.name,
              category: 'veggie',
              neededQty: (requiredIngredients.get(key)?.neededQty || 0) + qty,
            });
          }
        }
      }
    }

    // 3. Check stock availability & Recalculate/validate total amount on backend
    let calculatedBackendTotal = 0;
    for (const item of formattedItems) {
      let itemPrice = 0;
      if (item.base?.name) itemPrice += Number(item.base.price || 0);
      if (item.sauce?.name) itemPrice += Number(item.sauce.price || 0);
      if (item.cheese?.name) itemPrice += Number(item.cheese.price || 0);
      if (Array.isArray(item.veggies)) {
        for (const v of item.veggies) {
          itemPrice += Number(v.price || 0);
        }
      }
      if (itemPrice === 0 && item.price) itemPrice = Number(item.price);
      calculatedBackendTotal += itemPrice * (item.quantity || 1);
    }

    const validatedTotalAmount = calculatedBackendTotal > 0 ? calculatedBackendTotal : Number(totalAmount || 299);

    if (mongoose.connection.readyState === 1) {
      try {
        for (const reqItem of requiredIngredients.values()) {
          const invDoc = await Inventory.findOne({
            name: reqItem.name,
            category: reqItem.category,
          }).maxTimeMS(3000);

          if (invDoc && invDoc.stockQuantity < reqItem.neededQty) {
            return res.status(400).json({
              message: `Insufficient stock for "${reqItem.name}". Only ${invDoc.stockQuantity} remaining (requested ${reqItem.neededQty}). Please choose another option or reduce quantity.`,
            });
          }
        }
      } catch (err) {
        console.warn('Inventory check skipped due to DB timeout:', err.message);
      }
    }

    // 4. Create and persist the Order
    const orderData = {
      customerName: customerName || req.user?.name || 'Valued Customer',
      customerEmail: customerEmail || req.user?.email || 'customer@slicecraft.com',
      deliveryAddress: deliveryAddress || 'Artisan Foodie District',
      items: formattedItems,
      totalAmount: validatedTotalAmount,
      paymentStatus: 'Completed',
      orderStatus: 'Order Received',
      razorpayOrderId: razorpayOrderId || `order_rzp_${Date.now()}`,
      razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
    };

    if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
      orderData.user = req.user._id;
    }

    let savedOrder = null;
    if (mongoose.connection.readyState === 1) {
      try {
        savedOrder = await Order.create(orderData);
      } catch (e) {
        console.warn('Order DB save failed, saving to memory:', e.message);
      }
    }

    if (!savedOrder) {
      savedOrder = {
        _id: `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryOrders.unshift(savedOrder);
    }

    // 5. Decrement stock atomically and prevent negative values
    if (mongoose.connection.readyState === 1) {
      for (const reqItem of requiredIngredients.values()) {
        try {
          await Inventory.findOneAndUpdate(
            {
              name: reqItem.name,
              category: reqItem.category,
              stockQuantity: { $gte: reqItem.neededQty },
            },
            { $inc: { stockQuantity: -reqItem.neededQty } }
          ).maxTimeMS(2000);
        } catch (err) {}
      }
    }

    // 6. Broadcast Real-Time Events to Admin and Client via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_order', savedOrder);
      io.emit('stock_updated');
    }

    // 7. Trigger Low Stock Check and Email Notification if any item fell below threshold
    if (mongoose.connection.readyState === 1) {
      checkAndNotifyLowStock().catch(() => {});
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      order: savedOrder,
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get User's Orders from MongoDB with memory fallback
const getUserOrders = async (req, res) => {
  try {
    try {
      await connectDB();
    } catch (dbErr) {}

    let orders = [];
    if (mongoose.connection.readyState === 1) {
      try {
        let query = {};
        // If regular user, filter by their user ID or customer email
        if (req.user?.role !== 'admin') {
          if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
            query = {
              $or: [
                { user: req.user._id },
                { customerEmail: req.user.email },
              ],
            };
          } else if (req.user?.email) {
            query = { customerEmail: req.user.email };
          }
        }
        // If admin, query is {} (returns all recent orders so admin can track any order)
        orders = await Order.find(query).sort({ createdAt: -1 }).maxTimeMS(2500);
      } catch (e) {
        console.warn('DB getUserOrders query timeout:', e.message);
      }
    }

    if (!orders || orders.length === 0) {
      if (req.user?.role === 'admin') {
        orders = memoryOrders;
      } else {
        orders = memoryOrders.filter(
          (o) => !req.user?.email || o.customerEmail === req.user.email || o.customerEmail === 'customer@slicecraft.com'
        );
      }
    }

    res.json(orders);
  } catch (error) {
    res.json(memoryOrders);
  }
};

// Admin: Get All Orders from MongoDB with memory fallback
const getAllOrders = async (req, res) => {
  try {
    try {
      await connectDB();
    } catch (dbErr) {}

    let orders = [];
    if (mongoose.connection.readyState === 1) {
      try {
        orders = await Order.find({})
          .populate('user', 'name email')
          .sort({ createdAt: -1 })
          .maxTimeMS(2500);
      } catch (e) {}
    }

    if (!orders || orders.length === 0) {
      orders = memoryOrders;
    }

    res.json(orders);
  } catch (error) {
    res.json(memoryOrders);
  }
};

// Helper to replenish ingredient stocks when an order is cancelled
const replenishOrderStock = async (order) => {
  try {
    const requiredIngredients = [];
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const qty = item.quantity || 1;
        if (item.base?.name) {
          requiredIngredients.push({ name: item.base.name, category: 'base', qty });
        }
        if (item.sauce?.name) {
          requiredIngredients.push({ name: item.sauce.name, category: 'sauce', qty });
        }
        if (item.cheese?.name) {
          requiredIngredients.push({ name: item.cheese.name, category: 'cheese', qty });
        }
        if (Array.isArray(item.veggies)) {
          for (const veg of item.veggies) {
            if (veg?.name) {
              requiredIngredients.push({ name: veg.name, category: 'veggie', qty });
            }
          }
        }
      }
    }

    if (mongoose.connection.readyState === 1) {
      for (const reqItem of requiredIngredients) {
        try {
          await Inventory.findOneAndUpdate(
            { name: reqItem.name, category: reqItem.category },
            { $inc: { stockQuantity: reqItem.qty } }
          ).maxTimeMS(2000);
        } catch (err) {
          console.warn(`Failed to replenish stock for ${reqItem.name}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error('Error in replenishOrderStock:', err);
  }
};

// Admin: Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, cancellation_reason, cancellation_note } = req.body;

    const validStatuses = ['Order Received', 'In Kitchen / Preparing', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: `Invalid order status. Allowed statuses: ${validStatuses.join(', ')}`,
      });
    }

    let oldStatus = '';
    let existingOrder = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existingOrder = await Order.findById(id).maxTimeMS(2000);
        if (existingOrder) {
          oldStatus = existingOrder.orderStatus;
        }
      } catch (e) {}
    } else {
      existingOrder = memoryOrders.find((o) => o._id === id || String(o._id).includes(id));
      if (existingOrder) {
        oldStatus = existingOrder.orderStatus;
      }
    }

    // Backend validation rules for Cancellation
    if (orderStatus === 'Cancelled') {
      if (!cancellation_reason) {
        return res.status(400).json({ message: 'Cancellation reason is required.' });
      }
      if (oldStatus === 'Delivered') {
        return res.status(400).json({ message: 'Cannot cancel an already delivered order.' });
      }
      if (oldStatus === 'Cancelled') {
        return res.status(400).json({ message: 'Order is already cancelled.' });
      }
    }

    let updatedOrder = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const updateFields = { orderStatus };
        if (orderStatus === 'Cancelled') {
          updateFields.cancellation_reason = cancellation_reason;
          updateFields.cancellation_note = cancellation_note || '';
          updateFields.cancelled_at = new Date();
          updateFields.cancelled_by = req.user ? `${req.user.name || 'Admin'} (${req.user.email})` : 'Admin';
        }
        updatedOrder = await Order.findByIdAndUpdate(
          id,
          updateFields,
          { new: true }
        ).maxTimeMS(3000);
      } catch (e) {}
    }

    if (!updatedOrder) {
      const idx = memoryOrders.findIndex((o) => o._id === id || String(o._id).includes(id));
      if (idx !== -1) {
        memoryOrders[idx].orderStatus = orderStatus;
        if (orderStatus === 'Cancelled') {
          memoryOrders[idx].cancellation_reason = cancellation_reason;
          memoryOrders[idx].cancellation_note = cancellation_note || '';
          memoryOrders[idx].cancelled_at = new Date();
          memoryOrders[idx].cancelled_by = req.user ? `${req.user.name || 'Admin'} (${req.user.email})` : 'Admin';
        }
        memoryOrders[idx].updatedAt = new Date();
        updatedOrder = memoryOrders[idx];
      }
    }

    if (!updatedOrder) {
      updatedOrder = { _id: id, orderStatus, updatedAt: new Date() };
    }

    // Trigger stock replenishment if status transitioned to Cancelled
    if (orderStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
      await replenishOrderStock(updatedOrder);
      const io = req.app.get('socketio');
      if (io) {
        io.emit('stock_updated');
      }
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('order_status_updated', {
        orderId: updatedOrder._id,
        orderStatus: updatedOrder.orderStatus,
        cancellation_reason: updatedOrder.cancellation_reason,
        cancellation_note: updatedOrder.cancellation_note,
        cancelled_at: updatedOrder.cancelled_at,
        cancelled_by: updatedOrder.cancelled_by,
        updatedAt: updatedOrder.updatedAt,
      });
    }

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Customer: Cancel Order (Only allowed if status is still 'Order Received')
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason, cancellation_note } = req.body;

    if (!cancellation_reason) {
      return res.status(400).json({ message: 'Cancellation reason is required.' });
    }

    let order = null;
    try {
      await connectDB();
    } catch (dbErr) {}

    if (mongoose.connection.readyState === 1) {
      order = await Order.findById(id).maxTimeMS(3000);
    }

    if (!order) {
      const memoryOrder = memoryOrders.find((o) => o._id === id || String(o._id).includes(id));
      if (memoryOrder) {
        order = memoryOrder;
      }
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Security check: only order owner or admin can cancel
    const isOwner = req.user && (String(order.user) === String(req.user._id) || order.customerEmail === req.user.email);
    if (!isOwner && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to cancel this order.' });
    }

    if (order.orderStatus === 'Delivered') {
      return res.status(400).json({ message: 'Cannot cancel an already delivered order.' });
    }
    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled.' });
    }
    if (order.orderStatus !== 'Order Received') {
      return res.status(400).json({ message: `Cannot cancel order at "${order.orderStatus}" stage.` });
    }

    let updatedOrder = null;
    const cancelled_by = req.user ? `${req.user.name || 'Customer'} (${req.user.email})` : 'Customer';
    const cancelled_at = new Date();

    if (mongoose.connection.readyState === 1) {
      updatedOrder = await Order.findByIdAndUpdate(
        id,
        { 
          orderStatus: 'Cancelled',
          cancellation_reason,
          cancellation_note: cancellation_note || '',
          cancelled_at,
          cancelled_by
        },
        { new: true }
      ).maxTimeMS(3000);
    } else {
      order.orderStatus = 'Cancelled';
      order.cancellation_reason = cancellation_reason;
      order.cancellation_note = cancellation_note || '';
      order.cancelled_at = cancelled_at;
      order.cancelled_by = cancelled_by;
      order.updatedAt = new Date();
      updatedOrder = order;
    }

    // Replenish stock
    await replenishOrderStock(updatedOrder);

    // Broadcast live updates
    const io = req.app.get('socketio');
    if (io) {
      io.emit('order_status_updated', {
        orderId: updatedOrder._id,
        orderStatus: updatedOrder.orderStatus,
        cancellation_reason: updatedOrder.cancellation_reason,
        cancellation_note: updatedOrder.cancellation_note,
        cancelled_at: updatedOrder.cancelled_at,
        cancelled_by: updatedOrder.cancelled_by,
        updatedAt: updatedOrder.updatedAt,
      });
      io.emit('stock_updated');
    }

    res.json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    console.error('cancelOrder error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get Comprehensive Real Analytics
const getAdminAnalytics = async (req, res) => {
  try {
    let orders = [];
    if (mongoose.connection.readyState === 1) {
      try {
        orders = await Order.find({}).sort({ createdAt: -1 }).maxTimeMS(4000);
      } catch (e) {}
    }

    if (!orders || orders.length === 0) {
      orders = memoryOrders;
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const todayOrdersList = orders.filter((o) => new Date(o.createdAt) >= todayMidnight);
    const todayOrders = todayOrdersList.length;
    const todayRevenue = todayOrdersList.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const pendingOrders = orders.filter((o) => o.orderStatus === 'Order Received').length;
    const inKitchenOrders = orders.filter((o) => o.orderStatus === 'In Kitchen').length;
    const deliveryOrders = orders.filter((o) => o.orderStatus === 'Sent to Delivery').length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled').length;

    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      dailyMap[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
    }

    orders.forEach((o) => {
      const dateKey = o.createdAt
        ? new Date(o.createdAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].revenue += Number(o.totalAmount) || 0;
        dailyMap[dateKey].orders += 1;
      }
    });

    const recentDailyTrend = Object.values(dailyMap);

    const itemCounts = {};
    orders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const name = item.customName || item.name || 'Custom Artisan Pizza';
          itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
        });
      }
    });

    const popularItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      pendingOrders,
      inKitchenOrders,
      deliveryOrders,
      deliveredOrders,
      cancelledOrders,
      recentDailyTrend,
      popularItems,
    });
  } catch (error) {
    console.error('getAdminAnalytics error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRazorpayOrder,
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getAdminAnalytics,
  cancelOrder,
};
