const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const sendEmail = require('./sendEmail');

const initCronJobs = () => {
  // Run every 10 minutes (or every minute for testing)
  cron.schedule('*/10 * * * *', async () => {
    console.log('⏰ [Cron Job] Running automated inventory check...');
    try {
      const lowStockItems = await Inventory.find({
        $expr: { $lte: ['$stockQuantity', '$minThreshold'] },
      });

      if (lowStockItems.length > 0) {
        console.log(`⚠️ Found ${lowStockItems.length} items with low stock!`);

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzadelivery.com';
        const itemsListHtml = lowStockItems
          .map(
            (item) =>
              `<li><strong>${item.name}</strong> (${item.category}): Current Stock = <strong>${item.stockQuantity}</strong> (Threshold: ${item.minThreshold})</li>`
          )
          .join('');

        await sendEmail({
          to: adminEmail,
          subject: '🚨 URGENT: Low Stock Alert - Pizza Delivery Platform',
          html: `
            <h2>Low Stock Alert Notification</h2>
            <p>The following inventory items have fallen below their configured stock threshold:</p>
            <ul>${itemsListHtml}</ul>
            <p>Please restock these items in the Admin Dashboard immediately.</p>
          `,
          text: `Low Stock Alert: ${lowStockItems.map((i) => `${i.name} (${i.stockQuantity})`).join(', ')}`,
        });
      } else {
        console.log('✅ All inventory stock levels are healthy.');
      }
    } catch (error) {
      console.error('Error executing inventory cron job:', error);
    }
  });
};

module.exports = initCronJobs;
