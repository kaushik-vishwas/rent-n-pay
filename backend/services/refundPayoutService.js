import Order from '../models/Order.js';
import {
  ensureCustomerFundAccount,
  ensureCustomerFundAccountForCancel,
  createPayout,
} from './razorpayxService.js';

export const runRefundPayoutBatch = async () => {
  // Admin-approved refunds that haven't been paid out yet, and are at
  // least 5 days past approval.
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const orders = await Order.find({
    'products.returnRequest.refundApprovedAt': { $ne: null, $lte: fiveDaysAgo },
    'products.returnRequest.refundPaidAt': null,
  });

  const results = { total: 0, paid: 0, failed: 0, skipped: 0, errors: [] };

  for (const order of orders) {
    for (const line of order.products || []) {
      const rr = line.returnRequest;
      if (!rr || !rr.refundApprovedAt || rr.refundPaidAt) continue;
      if (rr.refundApprovedAt > fiveDaysAgo) continue; // not due yet
      if (rr.refundMethod !== 'bank') {
        // Only bank-transfer refunds are auto-paid via RazorpayX for now.
        continue;
      }

      results.total += 1;

      const details = rr.refundDetails || {};
      if (
        !details.bankAccountName ||
        !details.bankAccountNumber ||
        !details.bankIfsc
      ) {
        results.skipped += 1;
        results.errors.push({
          orderId: order._id,
          lineId: line._id,
          reason: 'Missing customer bank details',
        });
        continue;
      }

      try {
        const { fundAccountId } = await ensureCustomerFundAccount(order, line);

        const payout = await createPayout({
          fundAccountId,
          amountInRupees: rr.finalRefundAmount,
          narration: `Refund ${line._id}`,
          referenceId: `${order._id}_${line._id}`,
        });

        rr.refundPaidAt = new Date();
        // refundPaidBy is a strict ObjectId field (admin user reference) —
        // leave it null for auto-cron runs instead of casting a string into it.
        rr.refundTransactionId = payout.id;
        await order.save();

        results.paid += 1;
      } catch (err) {
        results.failed += 1;
        results.errors.push({
          orderId: order._id,
          lineId: line._id,
          reason:
            err?.response?.data?.error?.description ||
            err?.error?.description ||
            err?.message ||
            'Unknown payout error',
        });
      }
    }
  }

  console.log('[Refund Payout Batch]', results);
  return results;
};

// Same idea as runRefundPayoutBatch, but for plain order CANCELLATIONS
// (pre-delivery cancel flow) instead of post-delivery return/pickup
// refunds. A line becomes payable 5 days after its own cancelledAt date.
export const runCancelRefundPayoutBatch = async () => {
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  const orders = await Order.find({
    'products.cancelledAt': { $ne: null, $lte: fiveDaysAgo },
    'products.cancelRefundStatus': 'pending',
  });

  const results = { total: 0, paid: 0, failed: 0, skipped: 0, errors: [] };

  for (const order of orders) {
    for (const line of order.products || []) {
      if (line.lineStatus !== 'cancelled') continue;
      if (line.cancelRefundStatus !== 'pending') continue;
      if (!line.cancelledAt || line.cancelledAt > fiveDaysAgo) continue; // not due yet
      const details = line.cancelRefundDetails || {};
      const isUpi = details.method === 'upi';

      results.total += 1;

      const missingDetails = isUpi
        ? !details.upiId
        : !details.bankAccountName ||
          !details.bankAccountNumber ||
          !details.bankIfsc;

      if (missingDetails) {
        results.skipped += 1;
        results.errors.push({
          orderId: order._id,
          lineId: line._id,
          reason: isUpi
            ? 'Missing customer UPI ID'
            : 'Missing customer bank details',
        });
        continue;
      }

      try {
        const { fundAccountId } = await ensureCustomerFundAccountForCancel(
          order,
          line,
        );

        const refundAmount = Number(line.refundBreakdown?.refundAmount || 0);

        const payout = await createPayout({
          fundAccountId,
          amountInRupees: refundAmount,
          narration: `Cancel refund ${line._id}`,
          referenceId: `cancel_${order._id}_${line._id}`,
        });

        line.cancelRefundStatus = 'paid';
        line.cancelRefundPaidAt = new Date();
        // cancelRefundPaidBy is a strict ObjectId (admin ref) — left null
        // for auto-cron runs, same convention as the return-refund batch.
        line.cancelRefundTransactionId = payout.id;
        await order.save();

        results.paid += 1;
      } catch (err) {
        results.failed += 1;
        results.errors.push({
          orderId: order._id,
          lineId: line._id,
          reason:
            err?.response?.data?.error?.description ||
            err?.error?.description ||
            err?.message ||
            'Unknown payout error',
        });
      }
    }
  }

  console.log('[Cancel Refund Payout Batch]', results);
  return results;
};
