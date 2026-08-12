const Inventory = require('../models/Inventory');

// Fallback in-memory inventory items if DB connection is unavailable
const mockInventoryItems = [
  // 5 Pizza Bases
  { _id: 'b1', name: 'Thin Crust Base', category: 'base', price: 120, stockQuantity: 50, minThreshold: 15, description: 'Crispy & classic thin dough base' },
  { _id: 'b2', name: 'Thick Pan Crust', category: 'base', price: 140, stockQuantity: 45, minThreshold: 15, description: 'Soft & fluffy deep dish pan base' },
  { _id: 'b3', name: 'Cheese Burst Base', category: 'base', price: 200, stockQuantity: 30, minThreshold: 10, description: 'Loaded with molten cheese inside the crust' },
  { _id: 'b4', name: 'Whole Wheat Crust', category: 'base', price: 150, stockQuantity: 40, minThreshold: 15, description: 'Healthy 100% whole grain wheat base' },
  { _id: 'b5', name: 'Gluten-Free Crust', category: 'base', price: 180, stockQuantity: 25, minThreshold: 10, description: 'Special artisan gluten-free dough' },

  // 5 Sauces
  { _id: 's1', name: 'Classic Tomato Sauce', category: 'sauce', price: 30, stockQuantity: 60, minThreshold: 20, description: 'Rich Italian sun-ripened tomato basil sauce' },
  { _id: 's2', name: 'Spicy Schezwan Sauce', category: 'sauce', price: 40, stockQuantity: 55, minThreshold: 20, description: 'Fiery & zesty chilli garlic sauce' },
  { _id: 's3', name: 'Creamy Garlic Alfredo', category: 'sauce', price: 50, stockQuantity: 50, minThreshold: 20, description: 'Rich white garlic butter cream sauce' },
  { _id: 's4', name: 'Smoky Barbecue Sauce', category: 'sauce', price: 45, stockQuantity: 40, minThreshold: 15, description: 'Sweet & smoky hickory BBQ glaze' },
  { _id: 's5', name: 'Fresh Basil Pesto', category: 'sauce', price: 60, stockQuantity: 35, minThreshold: 15, description: 'Aromatic basil & pine nut green pesto' },

  // Cheeses
  { _id: 'c1', name: '100% Mozzarella Cheese', category: 'cheese', price: 60, stockQuantity: 70, minThreshold: 25, description: 'Classic stretchy Italian mozzarella' },
  { _id: 'c2', name: 'Aged Cheddar Cheese', category: 'cheese', price: 70, stockQuantity: 50, minThreshold: 20, description: 'Sharp & tangy golden cheddar' },
  { _id: 'c3', name: 'Grated Parmesan Cheese', category: 'cheese', price: 80, stockQuantity: 45, minThreshold: 15, description: 'Hard aged salty parmesan flakes' },
  { _id: 'c4', name: 'Plant-Based Vegan Cheese', category: 'cheese', price: 90, stockQuantity: 30, minThreshold: 10, description: 'Dairy-free coconut oil based meltable cheese' },

  // Vegetables
  { _id: 'v1', name: 'Crunchy Capsicum', category: 'veggie', price: 25, stockQuantity: 80, minThreshold: 25, description: 'Fresh green bell peppers' },
  { _id: 'v2', name: 'Red Onions', category: 'veggie', price: 20, stockQuantity: 90, minThreshold: 30, description: 'Crisp sweet red onion slices' },
  { _id: 'v3', name: 'Button Mushrooms', category: 'veggie', price: 35, stockQuantity: 65, minThreshold: 20, description: 'Sliced fresh earthy mushrooms' },
  { _id: 'v4', name: 'Spicy Jalapenos', category: 'veggie', price: 30, stockQuantity: 70, minThreshold: 20, description: 'Pickled spicy Mexican jalapeno rings' },
  { _id: 'v5', name: 'Black Olives', category: 'veggie', price: 35, stockQuantity: 60, minThreshold: 20, description: 'Sliced Spanish black olives' },
  { _id: 'v6', name: 'Sweet Golden Corn', category: 'veggie', price: 25, stockQuantity: 85, minThreshold: 25, description: 'Juicy tender sweetcorn kernels' },
  { _id: 'v7', name: 'Juicy Tomatoes', category: 'veggie', price: 20, stockQuantity: 85, minThreshold: 25, description: 'Freshly diced ripe vine tomatoes' },

  // Presets
  {
    _id: 'p1',
    name: 'Margherita Supreme',
    category: 'pizza_preset',
    price: 299,
    stockQuantity: 100,
    minThreshold: 10,
    description: 'Classic Thin Crust with Italian Tomato Sauce and Double Mozzarella',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'p2',
    name: 'Farmhouse Feast',
    category: 'pizza_preset',
    price: 399,
    stockQuantity: 100,
    minThreshold: 10,
    description: 'Loaded with Capsicum, Onion, Mushroom & Fresh Tomatoes',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'p3',
    name: 'Fiery Jalapeno Special',
    category: 'pizza_preset',
    price: 449,
    stockQuantity: 100,
    minThreshold: 10,
    description: 'Spicy Schezwan base with Jalapenos, Black Olives & Golden Corn',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  },
];

let memoryInventory = [...mockInventoryItems];

// Get all options categorized for Pizza Builder / User Dashboard
const getPizzaOptions = async (req, res) => {
  try {
    let items = [];
    try {
      items = await Inventory.find({});
    } catch (e) {
      console.log('MongoDB query fallback to in-memory inventory store');
    }

    if (!items || items.length === 0) {
      items = memoryInventory;
    }

    const bases = items.filter((i) => i.category === 'base');
    const sauces = items.filter((i) => i.category === 'sauce');
    const cheeses = items.filter((i) => i.category === 'cheese');
    const veggies = items.filter((i) => i.category === 'veggie');
    const presets = items.filter((i) => i.category === 'pizza_preset');

    res.json({ bases, sauces, cheeses, veggies, presets, allItems: items });
  } catch (error) {
    console.error('getPizzaOptions error:', error);
    // Return fallback instead of 500 error
    const items = memoryInventory;
    res.json({
      bases: items.filter((i) => i.category === 'base'),
      sauces: items.filter((i) => i.category === 'sauce'),
      cheeses: items.filter((i) => i.category === 'cheese'),
      veggies: items.filter((i) => i.category === 'veggie'),
      presets: items.filter((i) => i.category === 'pizza_preset'),
      allItems: items,
    });
  }
};

// Admin: Get all inventory items
const getAllInventory = async (req, res) => {
  try {
    let inventory = [];
    try {
      inventory = await Inventory.find({}).sort({ category: 1, name: 1 });
    } catch (e) {}

    if (!inventory || inventory.length === 0) {
      inventory = memoryInventory;
    }
    res.json(inventory);
  } catch (error) {
    res.json(memoryInventory);
  }
};

// Admin: Update Stock Quantity / Threshold for an item
const updateInventoryStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity, minThreshold, price } = req.body;

    let updatedItem = null;
    try {
      const item = await Inventory.findById(id);
      if (item) {
        if (stockQuantity !== undefined) item.stockQuantity = Number(stockQuantity);
        if (minThreshold !== undefined) item.minThreshold = Number(minThreshold);
        if (price !== undefined) item.price = Number(price);
        updatedItem = await item.save();
      }
    } catch (e) {}

    if (!updatedItem) {
      const index = memoryInventory.findIndex((i) => i._id === id);
      if (index !== -1) {
        if (stockQuantity !== undefined) memoryInventory[index].stockQuantity = Number(stockQuantity);
        if (minThreshold !== undefined) memoryInventory[index].minThreshold = Number(minThreshold);
        if (price !== undefined) memoryInventory[index].price = Number(price);
        updatedItem = memoryInventory[index];
      }
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('inventory_updated', updatedItem);
    }

    res.json({ message: 'Inventory item updated successfully', item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Add new inventory item
const addInventoryItem = async (req, res) => {
  try {
    const { name, category, price, stockQuantity, minThreshold, description, image } = req.body;
    let newItem = null;
    try {
      newItem = await Inventory.create({
        name,
        category,
        price: price || 0,
        stockQuantity: stockQuantity || 100,
        minThreshold: minThreshold || 20,
        description,
        image,
      });
    } catch (e) {
      newItem = {
        _id: `item_${Date.now()}`,
        name,
        category,
        price: price || 0,
        stockQuantity: stockQuantity || 100,
        minThreshold: minThreshold || 20,
        description,
        image,
      };
      memoryInventory.push(newItem);
    }
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete inventory item
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await Inventory.findByIdAndDelete(id);
    } catch (e) {}

    const index = memoryInventory.findIndex((i) => i._id === id);
    if (index !== -1) {
      memoryInventory.splice(index, 1);
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('inventory_updated', { _id: id, deleted: true });
    }

    res.json({ message: 'Item deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPizzaOptions,
  getAllInventory,
  updateInventoryStock,
  addInventoryItem,
  deleteInventoryItem,
};

