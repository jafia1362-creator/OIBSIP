const express = require('express');
const router = express.Router();
const {
  getPizzaOptions,
  getAllInventory,
  updateInventoryStock,
  addInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/options', getPizzaOptions);
router.get('/admin/all', protect, admin, getAllInventory);
router.put('/admin/stock/:id', protect, admin, updateInventoryStock);
router.post('/admin/add', protect, admin, addInventoryItem);
router.delete('/admin/delete/:id', protect, admin, deleteInventoryItem);

module.exports = router;

