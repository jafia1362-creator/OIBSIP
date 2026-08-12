const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const sendEmail = require('./sendEmail');

/**
 * Checks all inventory items against their individual configured thresholds.
 * Avoids sending repetitive notifications if the stock level hasn't changed since the last notification.
 */
const checkAndNotifyLowStock = async () => {
  try {
    // 1. Reset lastNotifiedStock for any items that have been restocked above threshold
    await Inventory.updateMany(
      { $expr: { $gt: ['$stockQuantity', '$minThreshold'] }, lastNotifiedStock: { $ne: -1 } },
      { $set: { lastNotifiedStock: -1 } }
    );

    // 2. Find items at or below their item-specific threshold
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$stockQuantity', '$minThreshold'] },
    });

    if (lowStockItems.length === 0) {
      console.log('✅ All inventory stock levels are healthy.');
      return { count: 0, items: [] };
    }

    // 3. Filter for items that have not yet been alerted at their current stock level
    const itemsToNotify = lowStockItems.filter(
      (item) => item.lastNotifiedStock !== item.stockQuantity
    );

    if (itemsToNotify.length === 0) {
      console.log('ℹ️ Low stock items detected, but alerts have already been sent for their current levels.');
      return { count: 0, items: [] };
    }

    console.log(`⚠️ Sending low-stock notification for ${itemsToNotify.length} item(s)...`);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzadelivery.com';
    const itemsListHtml = itemsToNotify
      .map(
        (item) => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: bold; color: #1e293b;">${item.name}</td>
            <td style="padding: 10px; text-transform: uppercase; color: #64748b; font-size: 12px;">${item.category}</td>
            <td style="padding: 10px; color: #dc2626; font-weight: bold;">${item.stockQuantity}</td>
            <td style="padding: 10px; color: #475569;">${item.minThreshold}</td>
            <td style="padding: 10px;"><span style="background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">LOW STOCK</span></td>
          </tr>
        `
      )
      .join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #F7254F 0%, #FF8A00 100%); padding: 24px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">🚨 SliceCraft Inventory Alert</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">One or more ingredients have fallen below their configured stock threshold.</p>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 10px; color: #475569;">Item Name</th>
                <th style="padding: 10px; color: #475569;">Category</th>
                <th style="padding: 10px; color: #475569;">Current Stock</th>
                <th style="padding: 10px; color: #475569;">Min Threshold</th>
                <th style="padding: 10px; color: #475569;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
          </table>
          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
            Please log in to the <strong>SliceCraft Admin Portal</strong> to restock inventory items immediately.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `🚨 [Low Stock Alert] ${itemsToNotify.length} item(s) below threshold - SliceCraft`,
      html: emailHtml,
      text: `Low Stock Alert: ${itemsToNotify.map((i) => `${i.name} (Stock: ${i.stockQuantity}, Threshold: ${i.minThreshold})`).join('; ')}`,
    });

    // 4. Mark items as notified for their current stock level
    for (const item of itemsToNotify) {
      await Inventory.findByIdAndUpdate(item._id, {
        $set: { lastNotifiedStock: item.stockQuantity },
      });
    }

    return { count: itemsToNotify.length, items: itemsToNotify };
  } catch (error) {
    console.error('Error executing inventory low-stock check:', error);
    return { error: error.message };
  }
};

const initCronJobs = () => {
  // Run automated inventory check every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('⏰ [Cron Job] Running scheduled inventory low-stock check...');
    await checkAndNotifyLowStock();
  });
};

module.exports = {
  initCronJobs,
  checkAndNotifyLowStock,
};
