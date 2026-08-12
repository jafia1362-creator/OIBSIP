const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const initCronJobs = require('./utils/cronJobs');

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   DATABASE
========================================================= */

connectDB();

/* =========================================================
   CRON JOBS
========================================================= */

initCronJobs();

/* =========================================================
   SOCKET.IO
========================================================= */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

/* =========================================================
   API ROUTES
========================================================= */

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Pizza Delivery API is running smoothly!',
  });
});

/* =========================================================
   ROOT ROUTE
========================================================= */

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Pizza Delivery Backend API is running!',
    health: '/api/health',
  });
});

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

/* =========================================================
   LOCAL DEVELOPMENT SERVER
========================================================= */

// Vercel par app ko directly export kiya jayega.
// Local machine par server normally port 5000 par chalega.

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`🚀 Pizza Delivery Server listening on port ${PORT}`);
    console.log(`🌐 Local API: http://localhost:${PORT}`);
    console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
  });
}

/* =========================================================
   VERCEL EXPORT
========================================================= */

module.exports = app;