// import Settlement from '../models/Settlement.js';
// import Vendor from '../models/vendorAuthModel.js';
// import { ensureVendorFundAccount, createPayout } from './razorpayxService.js';
// import { sendVendorPayoutEmail } from './../utils/sendMail.js';

// export const runSettlementPayoutBatch = async () => {
//   const pending = await Settlement.find({ status: 'Pending' });

//   const results = {
//     total: pending.length,
//     paid: 0,
//     failed: 0,
//     skipped: 0,
//     errors: [],
//   };

//   for (const settlement of pending) {
//     try {
//       const vendor = await Vendor.findById(settlement.vendorId);

//       if (!vendor || vendor.bankDetails?.status !== 'Verified') {
//         results.skipped += 1;
//         results.errors.push({
//           settlementId: settlement._id,
//           reason: 'Vendor bank details missing or not verified',
//         });
//         continue;
//       }

//       // Re-check status right before paying (avoid double-pay if cron overlaps)
//       const fresh = await Settlement.findOneAndUpdate(
//         { _id: settlement._id, status: 'Pending' },
//         { $set: { status: 'Processing' } },
//         { new: true },
//       );
//       if (!fresh) {
//         results.skipped += 1;
//         continue; // someone else already picked this up
//       }

//       // const { fundAccountId } = await ensureVendorFundAccount(vendor);

//       // const payout = await createPayout({
//       //   fundAccountId,
//       //   amountInRupees: settlement.netPayout,
//       //   narration: `Settlement ${settlement._id}`,
//       //   referenceId: String(settlement._id),
//       // });

//       let { fundAccountId } = await ensureVendorFundAccount(vendor);

//       let payout;
//       try {
//         payout = await createPayout({
//           fundAccountId,
//           amountInRupees: settlement.netPayout,
//           narration: `Settlement ${settlement._id}`,
//           referenceId: String(settlement._id),
//         });
//       } catch (payoutErr) {
//         const rzpDescription =
//           payoutErr?.response?.data?.error?.description ||
//           payoutErr?.error?.description ||
//           payoutErr?.message ||
//           '';
//         const isStaleIdError = rzpDescription
//           .toLowerCase()
//           .includes('does not exist');

//         if (!isStaleIdError) throw payoutErr;

//         console.log(
//           ' Stale RazorpayX ID detected for vendor',
//           vendor._id,
//           '— recreating contact/fund account and retrying...',
//         );

//         // Stale cached fund account/contact — clear and recreate once, then retry
//         vendor.bankDetails.razorpayContactId = '';
//         vendor.bankDetails.razorpayFundAccountId = '';
//         await vendor.save();

//         const refreshed = await ensureVendorFundAccount(vendor);
//         fundAccountId = refreshed.fundAccountId;

//         console.log(
//           ' New fund account created:',
//           fundAccountId,
//           '— retrying payout...',
//         );

//         payout = await createPayout({
//           fundAccountId,
//           amountInRupees: settlement.netPayout,
//           narration: `Settlement ${settlement._id}`,
//           referenceId: String(settlement._id),
//         });
//       }

//       // fresh.status = 'Paid';
//       // fresh.paidAt = new Date();
//       // fresh.paidBy = 'auto-cron';
//       // fresh.razorpayPayoutId = payout.id;
//       // await fresh.save();

//       // results.paid += 1;

//       fresh.status = 'Paid';
//       fresh.paidAt = new Date();
//       fresh.paidBy = 'auto-cron';
//       fresh.razorpayPayoutId = payout.id;
//       await fresh.save();
//       if (vendor.emailAddress) {
//         try {
//           await sendVendorPayoutEmail(
//             vendor.emailAddress,
//             vendor.fullName,
//             fresh,
//             vendor.bankDetails?.accountNumber,
//           );
//         } catch (mailErr) {
//           console.error(
//             'Payout email failed for settlement',
//             settlement._id,
//             ':',
//             mailErr?.message || mailErr,
//           );
//         }
//       }

//       results.paid += 1;
//     } catch (err) {
//       console.error(
//         'Payout error for settlement',
//         settlement._id,
//         ':',
//         JSON.stringify(err?.response?.data || err?.message || err),
//       );
//       results.failed += 1;
//       results.errors.push({
//         settlementId: settlement._id,
//         reason:
//           err?.response?.data?.error?.description ||
//           err?.error?.description ||
//           err?.message ||
//           'Unknown payout error',
//       });

//       await Settlement.findOneAndUpdate(
//         { _id: settlement._id, status: 'Processing' },
//         { $set: { status: 'Pending' } },
//       );
//     }
//   }

//   console.log('[Settlement Payout Batch]', results);
//   return results;
// };

import Settlement from '../models/Settlement.js';
import Vendor from '../models/vendorAuthModel.js';
import Order from '../models/Order.js';
import { ensureVendorFundAccount, createPayout } from './razorpayxService.js';
import { sendVendorPayoutEmail } from './../utils/sendMail.js';

export const runSettlementPayoutBatch = async () => {
  const pending = await Settlement.find({ status: 'Pending' });

  const results = {
    total: pending.length,
    paid: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (const settlement of pending) {
    try {
      const vendor = await Vendor.findById(settlement.vendorId);

      if (!vendor || vendor.bankDetails?.status !== 'Verified') {
        results.skipped += 1;
        results.errors.push({
          settlementId: settlement._id,
          reason: 'Vendor bank details missing or not verified',
        });
        continue;
      }

      // Re-check status right before paying (avoid double-pay if cron overlaps)
      const fresh = await Settlement.findOneAndUpdate(
        { _id: settlement._id, status: 'Pending' },
        { $set: { status: 'Processing' } },
        { new: true },
      );
      if (!fresh) {
        results.skipped += 1;
        continue; // someone else already picked this up
      }

      // const { fundAccountId } = await ensureVendorFundAccount(vendor);

      // const payout = await createPayout({
      //   fundAccountId,
      //   amountInRupees: settlement.netPayout,
      //   narration: `Settlement ${settlement._id}`,
      //   referenceId: String(settlement._id),
      // });

      // Apply refund deduction (same logic as admin settlements view) so the
      // actual RazorpayX transfer matches what the admin dashboard shows.
      // Approved refund -> deduct post-QC finalRefundAmount.
      // Rejected refund -> deduct full deposit (100% refund to customer).
      let refundDeduction = 0;
      const order = await Order.findById(settlement.orderId).select('products');
      const line = order?.products?.id
        ? order.products.id(settlement.lineId)
        : order?.products?.find(
            (p) => String(p._id) === String(settlement.lineId),
          );
      const rr = line?.returnRequest;
      if (rr?.refundInitiatedAt) {
        if (rr.refundApprovedAt) {
          refundDeduction = Math.max(0, Number(rr.finalRefundAmount || 0));
        } else if (rr.refundRejectedAt) {
          refundDeduction = Math.max(0, Number(line?.refundableDeposit || 0));
        }
      }
      const payoutAmount = Math.max(
        0,
        Number(settlement.netPayout) - refundDeduction,
      );

      if (payoutAmount <= 0) {
        results.skipped += 1;
        results.errors.push({
          settlementId: settlement._id,
          reason: 'Payout amount is 0 or less after refund deduction',
        });
        await Settlement.findOneAndUpdate(
          { _id: settlement._id, status: 'Pending' },
          { $set: { status: 'Processing' } },
        );
        continue;
      }

      let { fundAccountId } = await ensureVendorFundAccount(vendor);

      let payout;
      try {
        payout = await createPayout({
          fundAccountId,
          amountInRupees: payoutAmount,
          narration: `Settlement ${settlement._id}`,
          referenceId: String(settlement._id),
        });
      } catch (payoutErr) {
        const rzpDescription =
          payoutErr?.response?.data?.error?.description ||
          payoutErr?.error?.description ||
          payoutErr?.message ||
          '';
        const isStaleIdError = rzpDescription
          .toLowerCase()
          .includes('does not exist');

        if (!isStaleIdError) throw payoutErr;

        console.log(
          ' Stale RazorpayX ID detected for vendor',
          vendor._id,
          '— recreating contact/fund account and retrying...',
        );

        // Stale cached fund account/contact — clear and recreate once, then retry
        vendor.bankDetails.razorpayContactId = '';
        vendor.bankDetails.razorpayFundAccountId = '';
        await vendor.save();

        const refreshed = await ensureVendorFundAccount(vendor);
        fundAccountId = refreshed.fundAccountId;

        console.log(
          ' New fund account created:',
          fundAccountId,
          '— retrying payout...',
        );

        payout = await createPayout({
          fundAccountId,
          amountInRupees: payoutAmount,
          narration: `Settlement ${settlement._id}`,
          referenceId: String(settlement._id),
        });
      }

      // fresh.status = 'Paid';
      // fresh.paidAt = new Date();
      // fresh.paidBy = 'auto-cron';
      // fresh.razorpayPayoutId = payout.id;
      // await fresh.save();

      // results.paid += 1;

      fresh.status = 'Paid';
      fresh.paidAt = new Date();
      fresh.paidBy = 'auto-cron';
      fresh.razorpayPayoutId = payout.id;
      fresh.netPayout = payoutAmount;
      await fresh.save();
      if (vendor.emailAddress) {
        try {
          await sendVendorPayoutEmail(
            vendor.emailAddress,
            vendor.fullName,
            fresh,
            vendor.bankDetails?.accountNumber,
          );
        } catch (mailErr) {
          console.error(
            'Payout email failed for settlement',
            settlement._id,
            ':',
            mailErr?.message || mailErr,
          );
        }
      }

      results.paid += 1;
    } catch (err) {
      console.error(
        'Payout error for settlement',
        settlement._id,
        ':',
        JSON.stringify(err?.response?.data || err?.message || err),
      );
      results.failed += 1;
      results.errors.push({
        settlementId: settlement._id,
        reason:
          err?.response?.data?.error?.description ||
          err?.error?.description ||
          err?.message ||
          'Unknown payout error',
      });

      await Settlement.findOneAndUpdate(
        { _id: settlement._id, status: 'Processing' },
        { $set: { status: 'Pending' } },
      );
    }
  }

  console.log('[Settlement Payout Batch]', results);
  return results;
};
