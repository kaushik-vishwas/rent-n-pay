import User from '../models/userAuthModel.js';
import {
  ensureWithdrawalFundAccount,
  createPayout,
} from './razorpayxService.js';
import { markRefereesPaidForWithdrawal } from '../controller/user/userController.js';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export const runReferralPayoutBatch = async () => {
  const cutoff = new Date(Date.now() - FIVE_DAYS_MS);

  // Users with at least one pending withdrawal requested 5+ days ago
  const users = await User.find({
    withdrawals: {
      $elemMatch: { status: 'pending', requestedAt: { $lte: cutoff } },
    },
  });

  const results = { total: 0, paid: 0, failed: 0, skipped: 0, errors: [] };

  for (const user of users) {
    const dueWithdrawals = user.withdrawals.filter(
      (w) => w.status === 'pending' && w.requestedAt <= cutoff,
    );

    for (const withdrawal of dueWithdrawals) {
      results.total += 1;
      try {
        if (!withdrawal.payoutBankSnapshot?.accountNumber) {
          results.skipped += 1;
          results.errors.push({
            withdrawalId: withdrawal._id,
            reason: 'Withdrawal has no bank snapshot on file',
          });
          continue;
        }

        // Re-check right before paying, to avoid double-pay if cron overlaps
        const fresh = await User.findOneAndUpdate(
          {
            _id: user._id,
            'withdrawals._id': withdrawal._id,
            'withdrawals.status': 'pending',
          },
          { $set: { 'withdrawals.$.status': 'processing' } },
          { new: true },
        );
        if (!fresh) {
          results.skipped += 1;
          continue; // someone else already picked this up
        }

        const freshWithdrawal = fresh.withdrawals.id(withdrawal._id);
        const { fundAccountId } = await ensureWithdrawalFundAccount(
          fresh,
          freshWithdrawal,
        );
        await fresh.save(); // persist the cached contact/fund-account IDs

        const payout = await createPayout({
          fundAccountId,
          amountInRupees: freshWithdrawal.amount,
          narration: `Referral payout ${freshWithdrawal._id}`,
          referenceId: String(freshWithdrawal._id),
        });

        await User.updateOne(
          { _id: user._id, 'withdrawals._id': freshWithdrawal._id },
          {
            $set: {
              'withdrawals.$.status': 'paid',
              'withdrawals.$.processedAt': new Date(),
              'withdrawals.$.utr': payout.id,
            },
          },
        );

        await markRefereesPaidForWithdrawal(
          user._id,
          freshWithdrawal.amount,
          payout.id,
          freshWithdrawal._id,
        );

        results.paid += 1;
      } catch (err) {
        results.failed += 1;
        results.errors.push({
          withdrawalId: withdrawal._id,
          reason:
            err?.response?.data?.error?.description ||
            err?.error?.description ||
            err?.message ||
            'Unknown payout error',
        });

        // Roll back to pending so tomorrow's cron retries it
        await User.updateOne(
          {
            _id: user._id,
            'withdrawals._id': withdrawal._id,
            'withdrawals.status': 'processing',
          },
          { $set: { 'withdrawals.$.status': 'pending' } },
        );
      }
    }
  }

  console.log('[Referral Payout Batch]', results);
  return results;
};
