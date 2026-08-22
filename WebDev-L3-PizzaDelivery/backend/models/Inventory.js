const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['base', 'sauce', 'cheese', 'veggie', 'pizza_preset'],
    },
    price: { type: Number, required: true, default: 0 },
    stockQuantity: { type: Number, required: true, default: 100 },
    minThreshold: { type: Number, required: true, default: 20 },
    lastNotifiedStock: { type: Number, default: -1 },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
