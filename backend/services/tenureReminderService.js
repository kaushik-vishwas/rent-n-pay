import Order from '../models/Order.js';
import { sendTenureExpiryEmail } from './../utils/sendMail.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const REMINDER_DAYS_BEFORE = 10;

const addDuration = (baseDate, duration, unit) => {
  const start = new Date(baseDate);
  if (Number.isNaN(start.getTime())) return null;
  const safeDuration = Math.max(0, Number(duration || 0));
  const isDay = String(unit || '')
    .toLowerCase()
    .includes('day');
  if (isDay) return new Date(start.getTime() + safeDuration * DAY_MS);
  const end = new Date(start);
  end.setMonth(end.getMonth() + safeDuration);
  return end;
};

const daysRemaining = (targetDate) => {
  const d = new Date(targetDate);
  if (Number.isNaN(d.getTime())) return -1;
  return Math.ceil((d.getTime() - Date.now()) / DAY_MS);
};

export const runTenureExpiryReminderBatch = async () => {
  const results = { checked: 0, sent: 0, failed: 0 };

  const orders = await Order.find({
    status: { $in: ['delivered', 'completed', 'confirmed', 'shipped'] },
  })
    .populate('user', 'fullName emailAddress')
    .populate('products.product', 'productName');

  for (const order of orders) {
    const orderStartDate =
      order.deliveredAt || order.updatedAt || order.createdAt;
    if (!order.user?.emailAddress) continue;

    for (const line of order.products || []) {
      const duration = Number(line.rentalDuration || order.rentalDuration || 0);
      if (!duration) continue;

      const unit = line.tenureUnit || order.tenureUnit || 'month';
      const endDate = addDuration(orderStartDate, duration, unit);
      if (!endDate) continue;

      const rem = daysRemaining(endDate);
      results.checked += 1;

      if (rem !== REMINDER_DAYS_BEFORE) continue;

      try {
        await sendTenureExpiryEmail(
          order.user.emailAddress,
          order.user.fullName,
          order,
          line,
          endDate,
        );
        results.sent += 1;
      } catch (err) {
        results.failed += 1;
        console.error(
          'Tenure reminder email failed for order',
          order._id,
          ':',
          err?.message || err,
        );
      }
    }
  }

  console.log('[Tenure Reminder Batch]', results);
  return results;
};
