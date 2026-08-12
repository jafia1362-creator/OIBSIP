const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

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

// Confirm Payment & Create Order + Decrement Stock in MongoDB
const placeOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      deliveryAddress,
      items,
      totalAmount,
      razorpayOrderId,
      razorpayPaymentId,
    } = req.body;

    // 1. Idempotency Check: Prevent duplicate order processing / double decrements
    if (razorpayOrderId) {
      const existingOrder = await Order.findOne({ razorpayOrderId });
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

    // 3. Check stock availability for all required ingredients in MongoDB
    for (const reqItem of requiredIngredients.values()) {
      const invDoc = await Inventory.findOne({
        name: reqItem.name,
        category: reqItem.category,
      });

      if (invDoc && invDoc.stockQuantity < reqItem.neededQty) {
        return res.status(400).json({
          message: `Insufficient stock for "${reqItem.name}". Only ${invDoc.stockQuantity} remaining (requested ${reqItem.neededQty}). Please choose another option or reduce quantity.`,
        });
      }
    }

    // 4. Create and persist the Order in MongoDB
    const orderData = {
      customerName: customerName || req.user?.name || 'Valued Customer',
      customerEmail: customerEmail || req.user?.email || 'customer@slicecraft.com',
      deliveryAddress: deliveryAddress || 'Artisan Foodie District',
      items: formattedItems,
      totalAmount: Number(totalAmount),
      paymentStatus: 'Completed',
      orderStatus: 'Order Received',
      razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
    };

    if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
      orderData.user = req.user._id;
    }

    const savedOrder = await Order.create(orderData);

    // 5. Decrement stock atomically and prevent negative values
    for (const reqItem of requiredIngredients.values()) {
      try {
        await Inventory.findOneAndUpdate(
          {
            name: reqItem.name,
            category: reqItem.category,
            stockQuantity: { $gte: reqItem.neededQty },
          },
          { $inc: { stockQuantity: -reqItem.neededQty } }
        );
      } catch (err) {
        console.error(`Stock decrement error for ${reqItem.name}:`, err.message);
      }
    }

    // 6. Broadcast Real-Time Events to Admin and Client via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_order', savedOrder);
      io.emit('stock_updated');
    }

    // 7. Trigger Low Stock Check and Email Notification if any item fell below threshold
    checkAndNotifyLowStock().catch((e) =>
      console.error('Background low-stock check error:', e.message)
    );

    res.status(201).json({
      message: 'Order placed successfully and persisted to MongoDB!',
      order: savedOrder,
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get User's Orders from MongoDB
const getUserOrders = async (req, res) => {
  try {
    let query = {};
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

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('getUserOrders error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Orders from MongoDB
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update Order Status in MongoDB
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: `Invalid order status. Allowed statuses: ${validStatuses.join(', ')}`,
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found in database' });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('order_status_updated', {
        orderId: updatedOrder._id,
        orderStatus: updatedOrder.orderStatus,
        updatedAt: updatedOrder.updatedAt,
      });
    }

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get Comprehensive Real Analytics from MongoDB
const getAdminAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    // Compute Today's Start (Midnight 00:00:00)
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

    // 7 Days Trend
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

    // Popular Pizza Items
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
};
