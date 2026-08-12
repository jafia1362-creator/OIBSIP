const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Inventory = require('./models/Inventory');

dotenv.config();

const initialInventory = [
  // 5 Pizza Bases
  { name: 'Thin Crust Base', category: 'base', price: 120, stockQuantity: 50, minThreshold: 15, description: 'Crispy & classic thin dough base' },
  { name: 'Thick Pan Crust', category: 'base', price: 140, stockQuantity: 45, minThreshold: 15, description: 'Soft & fluffy deep dish pan base' },
  { name: 'Cheese Burst Base', category: 'base', price: 200, stockQuantity: 30, minThreshold: 10, description: 'Loaded with molten cheese inside the crust' },
  { name: 'Whole Wheat Crust', category: 'base', price: 150, stockQuantity: 40, minThreshold: 15, description: 'Healthy 100% whole grain wheat base' },
  { name: 'Gluten-Free Crust', category: 'base', price: 180, stockQuantity: 25, minThreshold: 10, description: 'Special artisan gluten-free dough' },

  // 5 Sauces
  { name: 'Classic Tomato Sauce', category: 'sauce', price: 30, stockQuantity: 60, minThreshold: 20, description: 'Rich Italian sun-ripened tomato basil sauce' },
  { name: 'Spicy Schezwan Sauce', category: 'sauce', price: 40, stockQuantity: 55, minThreshold: 20, description: 'Fiery & zesty chilli garlic sauce' },
  { name: 'Creamy Garlic Alfredo', category: 'sauce', price: 50, stockQuantity: 50, minThreshold: 20, description: 'Rich white garlic butter cream sauce' },
  { name: 'Smoky Barbecue Sauce', category: 'sauce', price: 45, stockQuantity: 40, minThreshold: 15, description: 'Sweet & smoky hickory BBQ glaze' },
  { name: 'Fresh Basil Pesto', category: 'sauce', price: 60, stockQuantity: 35, minThreshold: 15, description: 'Aromatic basil & pine nut green pesto' },

  // Cheeses
  { name: '100% Mozzarella Cheese', category: 'cheese', price: 60, stockQuantity: 70, minThreshold: 25, description: 'Classic stretchy Italian mozzarella' },
  { name: 'Aged Cheddar Cheese', category: 'cheese', price: 70, stockQuantity: 50, minThreshold: 20, description: 'Sharp & tangy golden cheddar' },
  { name: 'Grated Parmesan Cheese', category: 'cheese', price: 80, stockQuantity: 45, minThreshold: 15, description: 'Hard aged salty parmesan flakes' },
  { name: 'Plant-Based Vegan Cheese', category: 'cheese', price: 90, stockQuantity: 30, minThreshold: 10, description: 'Dairy-free coconut oil based meltable cheese' },

  // Vegetables
  { name: 'Crunchy Capsicum', category: 'veggie', price: 25, stockQuantity: 80, minThreshold: 25, description: 'Fresh green bell peppers' },
  { name: 'Red Onions', category: 'veggie', price: 20, stockQuantity: 90, minThreshold: 30, description: 'Crisp sweet red onion slices' },
  { name: 'Button Mushrooms', category: 'veggie', price: 35, stockQuantity: 65, minThreshold: 20, description: 'Sliced fresh earthy mushrooms' },
  { name: 'Spicy Jalapenos', category: 'veggie', price: 30, stockQuantity: 70, minThreshold: 20, description: 'Pickled spicy Mexican jalapeno rings' },
  { name: 'Black Olives', category: 'veggie', price: 35, stockQuantity: 60, minThreshold: 20, description: 'Sliced Spanish black olives' },
  { name: 'Sweet Golden Corn', category: 'veggie', price: 25, stockQuantity: 85, minThreshold: 25, description: 'Juicy tender sweetcorn kernels' },
  { name: 'Juicy Tomatoes', category: 'veggie', price: 20, stockQuantity: 85, minThreshold: 25, description: 'Freshly diced ripe vine tomatoes' },

  // Preset Pizzas for Menu Display
  {
    name: 'Margherita Supreme',
    category: 'pizza_preset',
    price: 299,
    stockQuantity: 100,
    minThreshold: 10,
    description: 'Classic Thin Crust with Italian Tomato Sauce and Double Mozzarella',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Farmhouse Feast',
    category: 'pizza_preset',
    price: 399,
    stockQuantity: 100,
    minThreshold: 10,
    description: 'Loaded with Capsicum, Onion, Mushroom & Fresh Tomatoes',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Fiery Jalapeno Special',
    category: 'pizza_preset',
    price: 449,
    stockQuantity: 100,
    minThreshold: 10,
    description: 'Spicy Schezwan base with Jalapenos, Black Olives & Golden Corn',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pizza_delivery');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing inventory
    await Inventory.deleteMany({});
    await Inventory.insertMany(initialInventory);
    console.log('✅ Inventory options seeded successfully (5 bases, 5 sauces, cheeses, veggies & presets)!');

    // Create default Admin account if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzadelivery.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'admin123', // Will be hashed by user schema
        role: 'admin',
        isVerified: true,
      });
      console.log(`✅ Default Admin account created: ${adminEmail} (Password: admin123)`);
    } else {
      console.log(`ℹ️ Admin account already exists: ${adminEmail}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
