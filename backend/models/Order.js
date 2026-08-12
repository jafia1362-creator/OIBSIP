const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, default: 'Custom Artisan Pizza' },
  customName: { type: String, default: 'Custom Artisan Pizza' },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  base: { name: String, price: Number },
  sauce: { name: String, price: Number },
  cheese: { name: String, price: Number },
  veggies: [{ name: String, price: Number }],
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Received',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Completed',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
