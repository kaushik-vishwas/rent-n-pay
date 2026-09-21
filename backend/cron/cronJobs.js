import cron from 'node-cron';
import Order from '../models/Order.js';

const AUTO_CANCEL_MS = 30 * 60 * 1000;

export function startOrderAutoCancelCron() {
  cron.schedule('* * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - AUTO_CANCEL_MS);
      const result = await Order.updateMany(
        {
          status: 'pending',
          vendorAcknowledged: false,
          createdAt: { $lte: cutoff },
        },
        {
          $set: {
            status: 'cancelled',
            'products.$[].lineStatus': 'cancelled',
          },
        },
      );
      if (result.modifiedCount > 0) {
        console.log(
          `[AutoCancel] Cancelled ${result.modifiedCount} unacknowledged order(s).`,
        );
      }
    } catch (err) {
      console.error('[AutoCancel] Cron error:', err.message);
    }
  });

  console.log('[AutoCancel] Order auto-cancel cron started.');
}
