const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { initCronJobs } = require('./utils/cronJobs');

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io Setup (for local standalone server)
let io = null;
try {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  app.set('socketio', io);

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected to Socket.io: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
} catch (e) {
  console.warn('Socket.io initialization warning:', e.message);
}

// Middlewares
app.use(cors());
app.use(express.json());

// Ensure MongoDB is connected for every request in serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB middleware error:', err.message);
  }
  next();
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SliceCraft Pizza Delivery API is running smoothly!',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      inventory: '/api/inventory',
      orders: '/api/orders',
    },
  });
});

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pizza Delivery API is running smoothly!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);

// Connect DB at startup
connectDB();

// Only listen on port when executed directly (Local / Standalone Node.js)
if (require.main === module) {
  initCronJobs();
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Pizza Delivery Server listening on port ${PORT}`);
  });
}

// Export Express app for Vercel Serverless Functions
module.exports = app;
