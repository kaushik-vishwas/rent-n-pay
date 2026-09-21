import cron from 'node-cron';
import { runSettlementPayoutBatch } from '../services/settlementPayoutService.js';
import { runTenureExpiryReminderBatch } from '../services/tenureReminderService.js';
import {
  runRefundPayoutBatch,
  runCancelRefundPayoutBatch,
} from '../services/refundPayoutService.js';
import { runReferralPayoutBatch } from '../services/referralPayoutService.js';
export const startSettlementCron = () => {
  cron.schedule(
    '0 18 * * 0',
    async () => {
      console.log('[Cron] Running weekly settlement payout...');
      await runSettlementPayoutBatch();
    },
    { timezone: 'Asia/Kolkata' },
  );

  // Every day at 9:00 AM — check for rentals ending in 10 days
  cron.schedule(
    '0 9 * * *',
    async () => {
      console.log('[Cron] Running tenure expiry reminder check...');
      await runTenureExpiryReminderBatch();
    },
    { timezone: 'Asia/Kolkata' },
  );

  // Every day at 11:00 AM — pay out any customer refund that was
  // admin-approved 5+ days ago (the 5-day wait is enforced inside
  // runRefundPayoutBatch's query, not by the cron schedule itself).
  cron.schedule(
    '0 11 * * *',
    async () => {
      console.log('[Cron] Running refund payout check...');
      await runRefundPayoutBatch();
    },
    { timezone: 'Asia/Kolkata' },
  );

  // Every day at 11:00 AM — pay out any order-cancellation refund whose
  // cancelledAt date is 5+ days old (the 5-day wait is enforced inside
  // runCancelRefundPayoutBatch's query, not by the cron schedule itself).
  cron.schedule(
    '0 11 * * *',
    async () => {
      console.log('[Cron] Running cancel refund payout check...');
      await runCancelRefundPayoutBatch();
    },
    { timezone: 'Asia/Kolkata' },
  );

  // Every day at 11:00 AM — pay out any referral withdrawal requested
  // 5+ days ago (the 5-day wait is enforced inside runReferralPayoutBatch's
  // query, not by the cron schedule itself).
  cron.schedule(
    '0 11 * * *',
    async () => {
      console.log('[Cron] Running referral payout check...');
      await runReferralPayoutBatch();
    },
    { timezone: 'Asia/Kolkata' },
  );
};
