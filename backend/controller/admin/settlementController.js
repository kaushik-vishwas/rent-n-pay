import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import Settlement from '../../models/Settlement.js';
import Vendor from '../../models/vendorAuthModel.js';
import Category from '../../models/Category.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';
import { sendVendorBankChangeOtp } from '../../utils/sendMail.js';
import VendorBankAccount from '../../models/VendorBankAccount.js';
import VendorKyc from '../../models/VendorKyc.js';
import { getCityProductIds } from '../../utils/cityScope.js';
import { computeVendorLineMoney } from '../../utils/vendorPayout.js';
// const PLATFORM_FEE_RATE = 0.2;

// function getPeriodLabel(date) {
//   const d = new Date(date);
//   const month = d.toLocaleString('en-IN', { month: 'short' });
//   const year = d.getFullYear();
//   const day = d.getDate();
//   const half =
//     day <= 15 ? `1–15` : `16–${new Date(year, d.getMonth() + 1, 0).getDate()}`;
//   return `${month} ${half}, ${year}`;
// }

function getPeriodLabel(date) {
  const d = new Date(date);
  // Find Monday of this date's week
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() + diffToMonday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const fmt = (dt) =>
    `${dt.getDate()} ${dt.toLocaleString('en-IN', { month: 'short' })}`;

  const yearLabel = weekEnd.getFullYear();
  return `${fmt(weekStart)} – ${fmt(weekEnd)}, ${yearLabel}`;
}

function calcLineGross(line) {
  return Number(line.pricePerDay || 0) * Number(line.quantity || 1);
}

function settlementMoneyFromLine(line, rateMap, order = null) {
  const money = computeVendorLineMoney(line, rateMap, order);
  return {
    grossAmount: money.productGross,
    depositAmount: money.deposit,
    platformFee: money.commission,
    netPayout: money.netProduct,
  };
}

const PRODUCT_SETTLEMENT_SELECT =
  'productName vendorId category rentalConfigurations createdVia salesConfiguration type variants refundableDeposit';
// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/settlements
// Syncs Settlement docs from delivered/completed orders, returns all with status
// ─────────────────────────────────────────────────────────────────────────────
// export const getAdminSettlements = async (req, res) => {
//   try {
//     const orders = await Order.find({
//       status: { $in: ['delivered', 'completed'] },
//     })
//       .populate({
//         path: 'products.product',
//         select: 'productName vendorId category',
//         populate: { path: 'vendorId', select: 'fullName emailAddress' },
//       })
//       .sort({ createdAt: -1 });

//     // Upsert a Settlement doc for each vendor-order pair (create if not exists)
//     for (const order of orders) {
//       const byVendor = new Map();
//       for (const line of order.products) {
//         const product = line.product;
//         if (!product || typeof product === 'string') continue;
//         if (line.lineStatus === 'cancelled') continue;
//         const vendorId = String(
//           product.vendorId?._id || product.vendorId || '',
//         );
//         if (!vendorId) continue;
//         if (!byVendor.has(vendorId)) {
//           byVendor.set(vendorId, {
//             vendorId,
//             vendorName: product.vendorId?.fullName || 'Unknown Vendor',
//             lines: [],
//           });
//         }
//         byVendor.get(vendorId).lines.push(line);
//       }

//       for (const [vendorId, { vendorName, lines }] of byVendor) {
//         const gross = lines.reduce((s, l) => s + calcLineGross(l), 0);
//         if (!gross) continue;
//         const fee = Math.round(gross * PLATFORM_FEE_RATE);

//         // upsert: create only if doesn't exist — never overwrite status/paidAt
//         await Settlement.findOneAndUpdate(
//           { orderId: order._id, vendorId },
//           {
//             $setOnInsert: {
//               orderId: order._id,
//               vendorId,
//               vendorName,
//               period: getPeriodLabel(order.createdAt),
//               grossAmount: gross,
//               platformFee: fee,
//               netPayout: gross - fee,
//               status: 'Pending', // always starts Pending
//             },
//           },
//           { upsert: true, new: true },
//         );
//       }
//     }

//     // Now fetch all Settlement docs with latest data
//     const settlements = await Settlement.find().sort({ createdAt: -1 }).lean();

//     const result = settlements.map((s) => ({
//       _id: s._id,
//       settlementId: `SET-${String(s.orderId).slice(-6).toUpperCase()}`,
//       orderId: s.orderId,
//       vendorId: s.vendorId,
//       vendorName: s.vendorName,
//       period: s.period,
//       grossAmount: s.grossAmount,
//       platformFee: s.platformFee,
//       netPayout: s.netPayout,
//       status: s.status,
//       paidAt: s.paidAt,
//       createdAt: s.createdAt,
//     }));

//     const totalPaid = result
//       .filter((s) => s.status === 'Paid')
//       .reduce((a, s) => a + s.netPayout, 0);
//     const totalPending = result
//       .filter((s) => s.status === 'Pending')
//       .reduce((a, s) => a + s.netPayout, 0);
//     const upcoming = result
//       .filter((s) => s.status === 'Pending')
//       .reduce((a, s) => a + s.grossAmount, 0);

//     res.json({
//       settlements: result,
//       summary: {
//         totalPaid,
//         totalPending,
//         upcoming,
//         paidCount: result.filter((s) => s.status === 'Paid').length,
//         pendingCount: result.filter((s) => s.status === 'Pending').length,
//         totalCount: result.length,
//       },
//     });
//   } catch (err) {
//     console.error('getAdminSettlements error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getAdminSettlements = async (req, res) => {
//   try {
//     const orders = await Order.find({
//       status: { $in: ['delivered', 'completed'] },
//     })
//       .populate({
//         path: 'products.product',
//         select: 'productName vendorId category',
//         populate: { path: 'vendorId', select: 'fullName emailAddress' },
//       })
//       .sort({ createdAt: -1 });

//     // Build category → commissionRate lookup once
//     const categories = await Category.find()
//       .select('name commissionRate')
//       .lean();
//     const rateMap = new Map(
//       categories.map((c) => [c.name, Number(c.commissionRate) || 0]),
//     );
//     const FALLBACK_RATE = 20; // used only if a product's category isn't found

//     // Upsert a Settlement doc for each vendor-order pair (create if not exists)
//     for (const order of orders) {
//       const byVendor = new Map();
//       for (const line of order.products) {
//         const product = line.product;
//         if (!product || typeof product === 'string') continue;
//         if (line.lineStatus === 'cancelled') continue;
//         const vendorId = String(
//           product.vendorId?._id || product.vendorId || '',
//         );
//         if (!vendorId) continue;
//         if (!byVendor.has(vendorId)) {
//           byVendor.set(vendorId, {
//             vendorId,
//             vendorName: product.vendorId?.fullName || 'Unknown Vendor',
//             lines: [],
//           });
//         }
//         byVendor.get(vendorId).lines.push(line);
//       }

//       for (const [vendorId, { vendorName, lines }] of byVendor) {
//         let gross = 0;
//         let fee = 0;
//         for (const line of lines) {
//           const lineGross = calcLineGross(line);
//           const categoryName = line.product?.category || '';
//           const rate = rateMap.has(categoryName)
//             ? rateMap.get(categoryName)
//             : FALLBACK_RATE;
//           gross += lineGross;
//           fee += Math.round(lineGross * (rate / 100));
//         }
//         if (!gross) continue;

//         // upsert: create only if doesn't exist — never overwrite status/paidAt
//         await Settlement.findOneAndUpdate(
//           { orderId: order._id, vendorId },
//           {
//             $setOnInsert: {
//               orderId: order._id,
//               vendorId,
//               vendorName,
//               period: getPeriodLabel(order.createdAt),
//               grossAmount: gross,
//               platformFee: fee,
//               netPayout: gross - fee,
//               status: 'Pending', // always starts Pending
//             },
//           },
//           { upsert: true, new: true },
//         );
//       }
//     }

//     // Now fetch all Settlement docs with latest data
//     const settlements = await Settlement.find().sort({ createdAt: -1 }).lean();

//     const result = settlements.map((s) => ({
//       _id: s._id,
//       settlementId: `SET-${String(s.orderId).slice(-6).toUpperCase()}`,
//       orderId: s.orderId,
//       vendorId: s.vendorId,
//       vendorName: s.vendorName,
//       period: s.period,
//       grossAmount: s.grossAmount,
//       platformFee: s.platformFee,
//       netPayout: s.netPayout,
//       status: s.status,
//       paidAt: s.paidAt,
//       createdAt: s.createdAt,
//     }));

//     const totalPaid = result
//       .filter((s) => s.status === 'Paid')
//       .reduce((a, s) => a + s.netPayout, 0);
//     const totalPending = result
//       .filter((s) => s.status === 'Pending')
//       .reduce((a, s) => a + s.netPayout, 0);
//     const upcoming = result
//       .filter((s) => s.status === 'Pending')
//       .reduce((a, s) => a + s.grossAmount, 0);

//     res.json({
//       settlements: result,
//       summary: {
//         totalPaid,
//         totalPending,
//         upcoming,
//         paidCount: result.filter((s) => s.status === 'Paid').length,
//         pendingCount: result.filter((s) => s.status === 'Pending').length,
//         totalCount: result.length,
//       },
//     });
//   } catch (err) {
//     console.error('getAdminSettlements error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getAdminSettlements = async (req, res) => {
//   try {
//     const orders = await Order.find({})
//       .populate({
//         path: 'products.product',
//         select: 'productName vendorId category',
//         populate: { path: 'vendorId', select: 'fullName emailAddress' },
//       })
//       .sort({ createdAt: -1 });

//     // const categories = await Category.find()
//     //   .select('name commissionRate')
//     //   .lean();
//     // const rateMap = new Map(
//     //   categories.map((c) => [c.name, Number(c.commissionRate) || 0]),
//     // );
//     // const FALLBACK_RATE = 20;
//     // const SETTLEABLE = ['delivered', 'completed'];
//     const categories = await Category.find()
//       .select('name commissionRate')
//       .lean();
//     const rateMap = new Map(
//       categories.map((c) => [c.name, Number(c.commissionRate) || 0]),
//     );
//     const FALLBACK_RATE = 20;
//     const SETTLEABLE = ['delivered', 'completed'];

//     // Build orderId+lineId -> refund lookup, computed live (not stored),
//     // so settlement payout figures always reflect the refund's current
//     // status. Approved refunds deduct the post-QC finalRefundAmount;
//     // rejected refunds deduct the full deposit (100% refund to customer).
//     const refundMap = new Map();
//     for (const order of orders) {
//       for (const line of order.products || []) {
//         const rr = line?.returnRequest;
//         if (!rr?.refundInitiatedAt) continue;
//         const refundStatus = rr.refundApprovedAt
//           ? 'approved'
//           : rr.refundRejectedAt
//             ? 'rejected'
//             : 'pending';
//         let refundAmount = 0;
//         if (refundStatus === 'approved') {
//           refundAmount = Math.max(0, Number(rr.finalRefundAmount || 0));
//         } else if (refundStatus === 'rejected') {
//           refundAmount = Math.max(0, Number(line?.refundableDeposit || 0));
//         }
//         refundMap.set(`${order._id}_${line._id}`, {
//           refundAmount,
//           refundStatus,
//         });
//       }
//     }

//     for (const order of orders) {
//       for (const line of order.products) {
//         const product = line.product;
//         if (!product || typeof product === 'string') continue;
//         if (!SETTLEABLE.includes(line.lineStatus)) continue;

//         const vendorId = String(
//           product.vendorId?._id || product.vendorId || '',
//         );
//         if (!vendorId) continue;

//         const lineGross = calcLineGross(line);
//         if (!lineGross) continue;

//         const categoryName = line.product?.category || '';
//         const rate = rateMap.has(categoryName)
//           ? rateMap.get(categoryName)
//           : FALLBACK_RATE;
//         const lineFee = Math.round(lineGross * (rate / 100));

//         await Settlement.findOneAndUpdate(
//           { orderId: order._id, vendorId, lineId: line._id },
//           {
//             $setOnInsert: {
//               orderId: order._id,
//               vendorId,
//               vendorName: product.vendorId?.fullName || 'Unknown Vendor',
//               lineId: line._id,
//               period: getPeriodLabel(order.createdAt),
//               grossAmount: lineGross,
//               platformFee: lineFee,
//               netPayout: lineGross - lineFee,
//               status: 'Pending',
//             },
//           },
//           { upsert: true, new: true },
//         );
//       }
//     }

//     // const settlements = await Settlement.find().sort({ createdAt: -1 }).lean();
//     const orderNumberMap = new Map(
//       orders.map((o) => [String(o._id), o.orderNumber]),
//     );

//     // const settlements = await Settlement.find().sort({ createdAt: -1 }).lean();

//     // // const result = settlements.map((s) => ({
//     // //   _id: s._id,
//     // //   settlementId: `SET-${String(s.orderId).slice(-6).toUpperCase()}-${String(s.lineId).slice(-4).toUpperCase()}`,
//     // //   orderId: s.orderId,
//     // //   lineId: s.lineId,
//     // //   vendorId: s.vendorId,
//     // //   vendorName: s.vendorName,
//     // //   period: s.period,
//     // //   grossAmount: s.grossAmount,
//     // //   platformFee: s.platformFee,
//     // //   netPayout: s.netPayout,
//     // //   status: s.status,
//     // //   paidAt: s.paidAt,
//     // //   createdAt: s.createdAt,
//     // //   transactionId: s.razorpayPayoutId || '',
//     // // }));

//     // // const result = settlements.map((s) => ({
//     // //   _id: s._id,
//     // //   settlementId: `SET-${String(s.orderId).slice(-6).toUpperCase()}-${String(s.lineId).slice(-4).toUpperCase()}`,
//     // //   orderId: s.orderId,
//     // //   orderNumber: orderNumberMap.get(String(s.orderId)) ?? null,
//     // //   lineId: s.lineId,
//     // //   vendorId: s.vendorId,
//     // //   vendorName: s.vendorName,
//     // //   period: s.period,
//     // //   grossAmount: s.grossAmount,
//     // //   platformFee: s.platformFee,
//     // //   netPayout: s.netPayout,
//     // //   status: s.status,
//     // //   paidAt: s.paidAt,
//     // //   createdAt: s.createdAt,
//     // //   transactionId: s.razorpayPayoutId || '',
//     // // }));
//     // const result = settlements.map((s) => {
//     //   const refund = refundMap.get(`${s.orderId}_${s.lineId}`);
//     //   const refundAmount = refund ? refund.refundAmount : 0;
//     //   const refundStatus = refund ? refund.refundStatus : null;
//     //   return {
//     //     _id: s._id,
//     //     settlementId: `SET-${String(s.orderId).slice(-6).toUpperCase()}-${String(s.lineId).slice(-4).toUpperCase()}`,
//     //     orderId: s.orderId,

//     const settlements = await Settlement.find().sort({ createdAt: -1 }).lean();

//     // Sequential, human-readable settlement number (SET-0001, SET-0002, ...)
//     // — ONE number per (vendorId + period) GROUP, not per raw settlement
//     // line-item, since the UI groups all line-items in the same vendor's
//     // payout period into a single row. Numbered by each group's earliest
//     // createdAt so the numbering is stable and identical on admin + vendor.
//     const allAsc = await Settlement.find()
//       .select('_id vendorId period createdAt')
//       .sort({ createdAt: 1, _id: 1 })
//       .lean();
//     const groupNumberMap = new Map(); // groupKey -> number
//     const settlementNumberMap = new Map(); // settlement._id -> number
//     let nextGroupNumber = 1;
//     for (const s of allAsc) {
//       const groupKey = `${s.vendorId}-${s.period}`;
//       if (!groupNumberMap.has(groupKey)) {
//         groupNumberMap.set(groupKey, nextGroupNumber);
//         nextGroupNumber += 1;
//       }
//       settlementNumberMap.set(String(s._id), groupNumberMap.get(groupKey));
//     }

//     const result = settlements.map((s) => {
//       const refund = refundMap.get(`${s.orderId}_${s.lineId}`);
//       const refundAmount = refund ? refund.refundAmount : 0;
//       const refundStatus = refund ? refund.refundStatus : null;
//       return {
//         _id: s._id,
//         settlementId: `SET-${String(
//           settlementNumberMap.get(String(s._id)) || 0,
//         ).padStart(4, '0')}`,
//         orderId: s.orderId,
//         orderNumber: orderNumberMap.get(String(s.orderId)) ?? null,
//         lineId: s.lineId,
//         vendorId: s.vendorId,
//         vendorName: s.vendorName,
//         period: s.period,
//         grossAmount: s.grossAmount,
//         platformFee: s.platformFee,
//         refundAmount,
//         refundStatus,
//         netPayout: Math.max(0, s.netPayout - refundAmount),
//         status: s.status,
//         paidAt: s.paidAt,
//         createdAt: s.createdAt,
//         transactionId: s.razorpayPayoutId || '',
//       };
//     });

//     const totalPaid = result
//       .filter((s) => s.status === 'Paid')
//       .reduce((a, s) => a + s.netPayout, 0);
//     const totalPending = result
//       .filter((s) => s.status === 'Pending')
//       .reduce((a, s) => a + s.netPayout, 0);
//     const upcoming = result
//       .filter((s) => s.status === 'Pending')
//       .reduce((a, s) => a + s.grossAmount, 0);

//     res.json({
//       settlements: result,
//       summary: {
//         totalPaid,
//         totalPending,
//         upcoming,
//         paidCount: result.filter((s) => s.status === 'Paid').length,
//         pendingCount: result.filter((s) => s.status === 'Pending').length,
//         totalCount: result.length,
//       },
//     });
//   } catch (err) {
//     console.error('getAdminSettlements error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

export const getAdminSettlements = async (req, res) => {
  try {
    const cityProductIds = await getCityProductIds(req);
    let cityVendorIds = null;
    if (cityProductIds) {
      const cityProductsForVendors = await Product.find(
        { _id: { $in: cityProductIds } },
        { vendorId: 1 },
      ).lean();
      cityVendorIds = new Set(
        cityProductsForVendors.map((p) => String(p.vendorId)),
      );
    }

    const orders = await Order.find({})
      .populate({
        path: 'products.product',
        select: PRODUCT_SETTLEMENT_SELECT,
        populate: { path: 'vendorId', select: 'fullName emailAddress' },
      })
      .sort({ createdAt: -1 });

    // const categories = await Category.find()
    //   .select('name commissionRate')
    //   .lean();
    // const rateMap = new Map(
    //   categories.map((c) => [c.name, Number(c.commissionRate) || 0]),
    // );
    // const FALLBACK_RATE = 20;
    // const SETTLEABLE = ['delivered', 'completed'];
    const categories = await Category.find()
      .select('name commissionRate')
      .lean();
    const rateMap = new Map(
      categories.map((c) => [c.name, Number(c.commissionRate) || 0]),
    );
    const SETTLEABLE = ['delivered', 'completed'];

    // Build orderId+lineId -> refund lookup, computed live (not stored),
    // so settlement payout figures always reflect the refund's current
    // status. Approved refunds deduct the post-QC finalRefundAmount;
    // rejected refunds deduct the full deposit (100% refund to customer).
    const refundMap = new Map();
    for (const order of orders) {
      for (const line of order.products || []) {
        const rr = line?.returnRequest;
        if (!rr?.refundInitiatedAt) continue;
        const refundStatus = rr.refundApprovedAt
          ? 'approved'
          : rr.refundRejectedAt
            ? 'rejected'
            : 'pending';
        let refundAmount = 0;
        if (refundStatus === 'approved') {
          refundAmount = Math.max(0, Number(rr.finalRefundAmount || 0));
        } else if (refundStatus === 'rejected') {
          refundAmount = Math.max(0, Number(line?.refundableDeposit || 0));
        }
        refundMap.set(`${order._id}_${line._id}`, {
          refundAmount,
          refundStatus,
        });
      }
    }

    // for (const order of orders) {
    //   for (const line of order.products) {
    //     const product = line.product;
    //     if (!product || typeof product === 'string') continue;
    //     if (!SETTLEABLE.includes(line.lineStatus)) continue;

    for (const order of orders) {
      for (const line of order.products) {
        const product = line.product;
        if (!product || typeof product === 'string') continue;
        if (!SETTLEABLE.includes(line.lineStatus)) continue;
        if (line.productType !== 'Rental') continue;

        const vendorId = String(
          product.vendorId?._id || product.vendorId || '',
        );
        if (!vendorId) continue;

        // const lineGross = calcLineGross(line);
        // if (!lineGross) continue;

        // const categoryName = line.product?.category || '';
        const money = settlementMoneyFromLine(line, rateMap, order);
        if (!money.grossAmount) continue;
        const lineDeposit = money.depositAmount;
        const lineGross = money.grossAmount;
        const lineFee = money.platformFee;

        const existing = await Settlement.findOne({
          orderId: order._id,
          vendorId,
          lineId: line._id,
        }).select('status');

        const amountFields = {
          period: getPeriodLabel(order.createdAt),
          grossAmount: lineGross,
          depositAmount: lineDeposit,
          platformFee: lineFee,
          netPayout: lineGross - lineFee,
        };

        if (existing?.status === 'Paid') {
          continue;
        }

        await Settlement.findOneAndUpdate(
          { orderId: order._id, vendorId, lineId: line._id },
          {
            $setOnInsert: {
              orderId: order._id,
              vendorId,
              vendorName: product.vendorId?.fullName || 'Unknown Vendor',
              lineId: line._id,
              status: 'Pending',
            },
            $set: amountFields,
          },
          { upsert: true, new: true },
        );
      }
    }

    // const settlements = await Settlement.find().sort({ createdAt: -1 }).lean();
    const orderNumberMap = new Map(
      orders.map((o) => [String(o._id), o.orderNumber]),
    );

    // const settlements = await Settlement.find().sort({ createdAt: -1 }).lean();

    // // const result = settlements.map((s) => ({
    // //   _id: s._id,
    // //   settlementId: `SET-${String(s.orderId).slice(-6).toUpperCase()}-${String(s.lineId).slice(-4).toUpperCase()}`,
    // //   orderId: s.orderId,
    // //   lineId: s.lineId,
    // //   vendorId: s.vendorId,
    // //   vendorName: s.vendorName,
    // //   period: s.period,
    // //   grossAmount: s.grossAmount,
    // //   platformFee: s.platformFee,
    // //   netPayout: s.netPayout,
    // //   status: s.status,
    // //   paidAt: s.paidAt,
    // //   createdAt: s.createdAt,
    // //   transactionId: s.razorpayPayoutId || '',
    // // }));

    // // const result = settlements.map((s) => ({
    // //   _id: s._id,
    // //   settlementId: `SET-${String(s.orderId).slice(-6).toUpperCase()}-${String(s.lineId).slice(-4).toUpperCase()}`,
    // //   orderId: s.orderId,
    // //   orderNumber: orderNumberMap.get(String(s.orderId)) ?? null,
    // //   lineId: s.lineId,
    // //   vendorId: s.vendorId,
    // //   vendorName: s.vendorName,
    // //   period: s.period,
    // //   grossAmount: s.grossAmount,
    // //   platformFee: s.platformFee,
    // //   netPayout: s.netPayout,
    // //   status: s.status,
    // //   paidAt: s.paidAt,
    // //   createdAt: s.createdAt,
    // //   transactionId: s.razorpayPayoutId || '',
    // // }));
    // const result = settlements.map((s) => {
    //   const refund = refundMap.get(`${s.orderId}_${s.lineId}`);
    //   const refundAmount = refund ? refund.refundAmount : 0;
    //   const refundStatus = refund ? refund.refundStatus : null;
    //   return {
    //     _id: s._id,
    //     settlementId: `SET-${String(s.orderId).slice(-6).toUpperCase()}-${String(s.lineId).slice(-4).toUpperCase()}`,
    //     orderId: s.orderId,

    const settlements = await Settlement.find().sort({ createdAt: -1 }).lean();

    // Sequential, human-readable settlement number (SET-0001, SET-0002, ...)
    // — ONE number per (vendorId + period) GROUP, not per raw settlement
    // line-item, since the UI groups all line-items in the same vendor's
    // payout period into a single row. Numbered by each group's earliest
    // createdAt so the numbering is stable and identical on admin + vendor.
    const allAsc = await Settlement.find()
      .select('_id vendorId period createdAt')
      .sort({ createdAt: 1, _id: 1 })
      .lean();
    const groupNumberMap = new Map(); // groupKey -> number
    const settlementNumberMap = new Map(); // settlement._id -> number
    let nextGroupNumber = 1;
    for (const s of allAsc) {
      const groupKey = `${s.vendorId}-${s.period}`;
      if (!groupNumberMap.has(groupKey)) {
        groupNumberMap.set(groupKey, nextGroupNumber);
        nextGroupNumber += 1;
      }
      settlementNumberMap.set(String(s._id), groupNumberMap.get(groupKey));
    }

    const result = settlements.map((s) => {
      const refund = refundMap.get(`${s.orderId}_${s.lineId}`);
      const refundAmount = refund ? refund.refundAmount : 0;
      const refundStatus = refund ? refund.refundStatus : null;
      return {
        _id: s._id,
        settlementId: `SET-${String(
          settlementNumberMap.get(String(s._id)) || 0,
        ).padStart(4, '0')}`,
        orderId: s.orderId,
        orderNumber: orderNumberMap.get(String(s.orderId)) ?? null,
        lineId: s.lineId,
        vendorId: s.vendorId,
        vendorName: s.vendorName,
        // period: s.period,
        // grossAmount: s.grossAmount,
        // platformFee: s.platformFee,
        // refundAmount,
        // refundStatus,
        // netPayout: Math.max(0, s.netPayout - refundAmount),
        period: s.period,
        grossAmount: s.grossAmount,
        depositAmount: s.depositAmount || 0,
        platformFee: s.platformFee,
        refundAmount,
        refundStatus,
        netPayout: Math.max(0, s.netPayout - refundAmount),
        status: s.status,
        paidAt: s.paidAt,
        createdAt: s.createdAt,
        transactionId: s.razorpayPayoutId || '',
      };
    });

    const scopedResult = cityVendorIds
      ? result.filter((s) => cityVendorIds.has(String(s.vendorId)))
      : result;

    const totalPaid = scopedResult
      .filter((s) => s.status === 'Paid')
      .reduce((a, s) => a + s.netPayout, 0);
    // const totalPending = result
    //   .filter((s) => s.status === 'Pending')
    //   .reduce((a, s) => a + s.netPayout, 0);
    // const upcoming = result
    //   .filter((s) => s.status === 'Pending')
    //   .reduce((a, s) => a + s.grossAmount, 0);

    // res.json({
    //   settlements: result,
    //   summary: {
    //     totalPaid,
    //     totalPending,
    //     upcoming,
    //     paidCount: result.filter((s) => s.status === 'Paid').length,
    //     pendingCount: result.filter((s) => s.status === 'Pending').length,
    //     totalCount: result.length,
    //   },
    // });

    const totalPending = scopedResult
      .filter((s) => s.status === 'Pending')
      .reduce((a, s) => a + s.netPayout, 0);
    const upcoming = scopedResult
      .filter((s) => s.status === 'Pending')
      .reduce((a, s) => a + s.grossAmount, 0);

    res.json({
      settlements: scopedResult,
      summary: {
        totalPaid,
        totalPending,
        upcoming,
        paidCount: scopedResult.filter((s) => s.status === 'Paid').length,
        pendingCount: scopedResult.filter((s) => s.status === 'Pending').length,
        totalCount: scopedResult.length,
      },
    });
  } catch (err) {
    console.error('getAdminSettlements error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /admin/settlements/:settlementId/mark-paid
// Admin manually confirms they transferred the money → status becomes Paid
// ─────────────────────────────────────────────────────────────────────────────
export const markSettlementPaid = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await Settlement.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({ message: 'Settlement not found.' });
    }
    if (settlement.status === 'Paid') {
      return res.status(400).json({ message: 'Already marked as paid.' });
    }

    settlement.status = 'Paid';
    settlement.paidAt = new Date();
    settlement.paidBy = req.admin?._id || req.admin?.id || 'admin';
    await settlement.save();

    res.json({
      message: 'Settlement marked as paid.',
      settlement: {
        _id: settlement._id,
        status: settlement.status,
        paidAt: settlement.paidAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/settlements/:vendorId  (for VendorDetails financials tab)
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminVendorSettlements = async (req, res) => {
  try {
    const { vendorId } = req.params;
    // const settlements = await Settlement.find({ vendorId })
    //   .sort({ createdAt: -1 })
    //   .lean();

    const settlements = await Settlement.find({ vendorId })
      .sort({ createdAt: -1 })
      .populate('orderId', 'orderNumber')
      .lean();

    const result = settlements.map((s) => ({
      _id: s._id,
      settlementId: `SET-${String(s.orderId).slice(-6).toUpperCase()}`,
      orderId: s.orderId,
      period: s.period,
      grossAmount: s.grossAmount,
      platformFee: s.platformFee,
      netPayout: s.netPayout,
      status: s.status,
      paidAt: s.paidAt,
      createdAt: s.createdAt,
    }));

    const totalPaid = result
      .filter((s) => s.status === 'Paid')
      .reduce((a, s) => a + s.netPayout, 0);
    const totalPending = result
      .filter((s) => s.status === 'Pending')
      .reduce((a, s) => a + s.netPayout, 0);

    res.json({
      settlements: result,
      summary: {
        totalPaid,
        totalPending,
        upcoming: totalPending,
        paidCount: result.filter((s) => s.status === 'Paid').length,
        pendingCount: result.filter((s) => s.status === 'Pending').length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /vendor/bank-details
// ─────────────────────────────────────────────────────────────────────────────
export const getVendorBankDetails = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendor?.id;
    const vendor = await Vendor.findById(vendorId).select(
      'bankDetails fullName',
    );
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }
    res.json({ bankDetails: vendor.bankDetails || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// POST /vendor/bank-details/send-otp
// Vendor clicks "Change Account" → OTP sent to their registered email
// ─────────────────────────────────────────────────────────────────────────────
export const sendVendorBankChangeOtpHandler = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendor?.id;
    const vendor = await Vendor.findById(vendorId).select(
      'emailAddress bankChangeOtp bankChangeOtpExpire',
    );
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    vendor.bankChangeOtp = otp;
    vendor.bankChangeOtpExpire = Date.now() + 5 * 60 * 1000; // 5 mins
    await vendor.save();

    await sendVendorBankChangeOtp(vendor.emailAddress, otp);

    res.json({ message: 'OTP sent to your registered email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /vendor/bank-details/verify-otp
// Vendor enters OTP → unlocks the "Enter New Bank Details" modal
// ─────────────────────────────────────────────────────────────────────────────
export const verifyVendorBankChangeOtp = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendor?.id;
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required.' });
    }

    const vendor = await Vendor.findById(vendorId).select(
      'bankChangeOtp bankChangeOtpExpire',
    );
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    if (
      !vendor.bankChangeOtp ||
      String(vendor.bankChangeOtp) !== String(otp).trim() ||
      !vendor.bankChangeOtpExpire ||
      vendor.bankChangeOtpExpire < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Clear it so it can't be reused, but keep a short-lived "verified" grace window
    vendor.bankChangeOtp = null;
    vendor.bankChangeOtpExpire = null;
    await vendor.save();

    res.json({ message: 'OTP verified.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /vendor/bank-details
// Vendor submits new bank account for verification
// ─────────────────────────────────────────────────────────────────────────────
export const updateVendorBankDetails = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendor?.id;
    const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;

    if (!accountHolderName || !accountNumber || !ifscCode) {
      return res
        .status(400)
        .json({ message: 'Missing required bank details.' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    const chequeFile = req.files?.chequeImage?.[0];
    let chequeImageUrl = vendor.bankDetails?.chequeImage || '';

    if (chequeFile) {
      const uploadResult = await uploadImageToCloudinary(
        chequeFile.buffer,
        'vendor-bank-cheques',
      );
      chequeImageUrl = uploadResult.secure_url;
    } else if (!chequeImageUrl) {
      return res
        .status(400)
        .json({ message: 'Cancelled cheque / passbook image is required.' });
    }

    vendor.bankDetails = {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName: bankName || '',
      chequeImage: chequeImageUrl,
      verified: false,
      status: 'Pending',
      rejectionReason: '',
      reviewedAt: null,
      reviewedBy: '',
      updatedAt: new Date(),
    };
    await vendor.save();

    res.json({
      message: 'Bank details submitted for verification.',
      bankDetails: vendor.bankDetails,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /admin/vendors/bank-verifications
// // List vendors that have submitted bank details (all statuses, newest first)
// // ─────────────────────────────────────────────────────────────────────────────
// export const getAdminBankVerificationQueue = async (req, res) => {
//   try {
//     const vendors = await Vendor.find({
//       'bankDetails.status': { $in: ['Pending', 'Verified', 'Rejected'] },
//     })
//       .select('fullName emailAddress mobileNumber bankDetails')
//       .sort({ 'bankDetails.updatedAt': -1 });

//     const counts = {
//       pending: vendors.filter((v) => v.bankDetails?.status === 'Pending')
//         .length,
//       verified: vendors.filter((v) => v.bankDetails?.status === 'Verified')
//         .length,
//       rejected: vendors.filter((v) => v.bankDetails?.status === 'Rejected')
//         .length,
//     };

//     res.json({ vendors, counts });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // PATCH /admin/vendors/:vendorId/bank-verify
// // Admin approves the vendor's submitted bank details
// // ─────────────────────────────────────────────────────────────────────────────
// export const verifyVendorBankDetails = async (req, res) => {
//   try {
//     const { vendorId } = req.params;
//     const vendor = await Vendor.findById(vendorId);
//     if (!vendor || !vendor.bankDetails) {
//       return res
//         .status(404)
//         .json({ message: 'Vendor or bank details not found.' });
//     }

//     vendor.bankDetails.verified = true;
//     vendor.bankDetails.status = 'Verified';
//     vendor.bankDetails.rejectionReason = '';
//     vendor.bankDetails.reviewedAt = new Date();
//     vendor.bankDetails.reviewedBy = req.admin?._id || req.admin?.id || 'admin';
//     await vendor.save();

//     res.json({
//       message: 'Bank details verified.',
//       bankDetails: vendor.bankDetails,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // PATCH /admin/vendors/:vendorId/bank-reject
// // Admin rejects the vendor's submitted bank details with a reason
// // ─────────────────────────────────────────────────────────────────────────────
// export const rejectVendorBankDetails = async (req, res) => {
//   try {
//     const { vendorId } = req.params;
//     const { reason } = req.body;

//     if (!reason || !reason.trim()) {
//       return res.status(400).json({ message: 'Rejection reason is required.' });
//     }

//     const vendor = await Vendor.findById(vendorId);
//     if (!vendor || !vendor.bankDetails) {
//       return res
//         .status(404)
//         .json({ message: 'Vendor or bank details not found.' });
//     }

//     vendor.bankDetails.verified = false;
//     vendor.bankDetails.status = 'Rejected';
//     vendor.bankDetails.rejectionReason = reason.trim();
//     vendor.bankDetails.reviewedAt = new Date();
//     vendor.bankDetails.reviewedBy = req.admin?._id || req.admin?.id || 'admin';
//     await vendor.save();

//     res.json({
//       message: 'Bank details rejected.',
//       bankDetails: vendor.bankDetails,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve which record actually holds a vendor's "live" bank submission.
// Priority: VendorBankAccount (default) -> VendorKyc.bankDetails (default) -> legacy Vendor.bankDetails
// ─────────────────────────────────────────────────────────────────────────────
// const resolveVendorBankSource = async (vendor) => {
//   const bankAccount = await VendorBankAccount.findOne({
//     vendorId: vendor._id,
//     isDefault: true,
//   });
//   if (bankAccount) {
//     return { source: 'bankAccount', doc: bankAccount };
//   }

//   const kyc = await VendorKyc.findOne({ vendorId: vendor._id });
//   if (kyc?.bankDetails?.isDefault && kyc.bankDetails?.accountNumber) {
//     return { source: 'kyc', doc: kyc };
//   }

//   if (vendor.bankDetails?.accountNumber) {
//     return { source: 'legacy', doc: vendor };
//   }

//   return null;
// };

const resolveVendorBankSource = async (vendor) => {
  let bankAccount = await VendorBankAccount.findOne({
    vendorId: vendor._id,
    isDefault: true,
  });

  if (!bankAccount) {
    const kycForFallback = await VendorKyc.findOne({ vendorId: vendor._id })
      .select('bankDetails')
      .lean();
    const hasKycBank = Boolean(kycForFallback?.bankDetails?.accountNumber);

    if (!hasKycBank) {
      const allAccounts = await VendorBankAccount.find({
        vendorId: vendor._id,
        isActive: true,
      });
      if (allAccounts.length === 1) {
        bankAccount = allAccounts[0];
      }
    }
  }

  if (bankAccount) {
    return { source: 'bankAccount', doc: bankAccount };
  }

  // 3. KYC bank — stays default as long as no VendorBankAccount has ever
  // been explicitly marked default (we already checked that above and
  // found none), regardless of whether other, non-default accounts exist.
  const kyc = await VendorKyc.findOne({ vendorId: vendor._id });

  if (kyc?.bankDetails?.accountNumber) {
    return { source: 'kyc', doc: kyc };
  }
  // 4. Legacy vendor.bankDetails
  if (vendor.bankDetails?.accountNumber) {
    return { source: 'legacy', doc: vendor };
  }

  return null;
};

// Normalizes any of the 3 source shapes into what the admin frontend expects.
// const toAdminBankDetailsShape = (resolved) => {
//   if (!resolved) return null;
//   const { source, doc } = resolved;
//   const bd = source === 'bankAccount' ? doc : doc.bankDetails;

//   return {
//     _source: source, // 'bankAccount' | 'kyc' | 'legacy'
//     _sourceId: source === 'bankAccount' ? doc._id : doc._id, // bankAccount._id or vendor/kyc._id
//     accountHolderName: bd.accountHolderName || '',
//     accountNumber: bd.accountNumber || '',
//     ifscCode: bd.ifscCode || '',
//     // bankName: bd.bankName || '', // only legacy Vendor.bankDetails currently has this
//     bankName: bd.accountHolderName || '', // fallback: bankAccount/kyc sources have no bankName field, show holder name instead
//     chequeImage: bd.cancelledCheque || bd.chequeImage || '',
//     status: bd.status || 'Pending',
//     rejectionReason: bd.rejectionReason || '',
//   };
// };

const toAdminBankDetailsShape = (resolved) => {
  if (!resolved) return null;
  const { source, doc } = resolved;
  const bd = source === 'bankAccount' ? doc : doc.bankDetails;

  // If this bank account was submitted as part of KYC, and admin already
  // approved the vendor's overall KYC, treat the bank details as already
  // verified too — no separate admin bank-verification step needed.
  const effectiveStatus =
    source === 'kyc' && doc.status === 'approved'
      ? 'Verified'
      : bd.status || 'Pending';

  return {
    _source: source, // 'bankAccount' | 'kyc' | 'legacy'
    _sourceId: source === 'bankAccount' ? doc._id : doc._id, // bankAccount._id or vendor/kyc._id
    accountHolderName: bd.accountHolderName || '',
    accountNumber: bd.accountNumber || '',
    ifscCode: bd.ifscCode || '',
    // bankName: bd.bankName || '', // only legacy Vendor.bankDetails currently has this
    bankName: bd.accountHolderName || '', // fallback: bankAccount/kyc sources have no bankName field, show holder name instead
    chequeImage: bd.cancelledCheque || bd.chequeImage || '',
    status: effectiveStatus,
    rejectionReason: bd.rejectionReason || '',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/vendors/bank-verifications
// List vendors that have submitted bank details (all statuses, newest first)
// ─────────────────────────────────────────────────────────────────────────────
// export const getAdminBankVerificationQueue = async (req, res) => {
//   try {
//     const allVendors = await Vendor.find({}).select(
//       'fullName emailAddress mobileNumber bankDetails',
//     );

//     const resolvedList = await Promise.all(
//       allVendors.map(async (vendor) => {
//         const resolved = await resolveVendorBankSource(vendor);
//         if (!resolved) return null;
//         return {
//           _id: vendor._id,
//           fullName: vendor.fullName,
//           emailAddress: vendor.emailAddress,
//           mobileNumber: vendor.mobileNumber,
//           bankDetails: toAdminBankDetailsShape(resolved),
//         };
//       }),
//     );

//     const vendors = resolvedList
//       .filter(Boolean)
//       .sort(
//         (a, b) =>
//           new Date(b.bankDetails?.updatedAt || 0) -
//           new Date(a.bankDetails?.updatedAt || 0),
//       );

//     const counts = {
//       pending: vendors.filter((v) => v.bankDetails?.status === 'Pending')
//         .length,
//       verified: vendors.filter((v) => v.bankDetails?.status === 'Verified')
//         .length,
//       rejected: vendors.filter((v) => v.bankDetails?.status === 'Rejected')
//         .length,
//     };

//     res.json({ vendors, counts });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const getAdminBankVerificationQueue = async (req, res) => {
  try {
    const cityProductIds = await getCityProductIds(req);
    let vendorFilter = {};
    if (cityProductIds) {
      const cityProducts = await Product.find(
        { _id: { $in: cityProductIds } },
        { vendorId: 1 },
      ).lean();
      const cityVendorIds = [
        ...new Set(cityProducts.map((p) => String(p.vendorId))),
      ];
      vendorFilter = { _id: { $in: cityVendorIds } };
    }

    const allVendors = await Vendor.find(vendorFilter).select(
      'fullName emailAddress mobileNumber bankDetails',
    );

    const resolvedList = await Promise.all(
      allVendors.map(async (vendor) => {
        const resolved = await resolveVendorBankSource(vendor);
        if (!resolved) return null;
        return {
          _id: vendor._id,
          fullName: vendor.fullName,
          emailAddress: vendor.emailAddress,
          mobileNumber: vendor.mobileNumber,
          bankDetails: toAdminBankDetailsShape(resolved),
        };
      }),
    );

    const vendors = resolvedList
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b.bankDetails?.updatedAt || 0) -
          new Date(a.bankDetails?.updatedAt || 0),
      );

    const counts = {
      pending: vendors.filter((v) => v.bankDetails?.status === 'Pending')
        .length,
      verified: vendors.filter((v) => v.bankDetails?.status === 'Verified')
        .length,
      rejected: vendors.filter((v) => v.bankDetails?.status === 'Rejected')
        .length,
    };

    res.json({ vendors, counts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /admin/vendors/:vendorId/bank-verify
// Admin approves whichever record is the vendor's current live bank submission
// ─────────────────────────────────────────────────────────────────────────────
export const verifyVendorBankDetails = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    const resolved = await resolveVendorBankSource(vendor);
    if (!resolved) {
      return res
        .status(404)
        .json({ message: 'Bank details not found for this vendor.' });
    }

    const reviewedBy = req.admin?._id || req.admin?.id || 'admin';

    if (resolved.source === 'bankAccount') {
      const account = resolved.doc;
      account.verified = true;
      account.status = 'Verified';
      account.rejectionReason = '';
      account.reviewedAt = new Date();
      account.reviewedBy = reviewedBy;
      await account.save();
      return res.json({
        message: 'Bank details verified.',
        bankDetails: toAdminBankDetailsShape({
          source: 'bankAccount',
          doc: account,
        }),
      });
    }

    if (resolved.source === 'kyc') {
      const kyc = resolved.doc;
      // Bank details submitted as part of a KYC application should be
      // reviewed together with that KYC — don't allow verifying the bank
      // alone while the KYC itself is still pending/rejected.
      if (kyc.status !== 'approved') {
        return res.status(400).json({
          message:
            "Please approve this vendor's KYC application first — bank details are verified automatically once KYC is approved.",
        });
      }
      kyc.bankDetails.verified = true;
      kyc.bankDetails.status = 'Verified';
      kyc.bankDetails.rejectionReason = '';
      kyc.bankDetails.reviewedAt = new Date();
      kyc.bankDetails.reviewedBy = reviewedBy;
      await kyc.save();
      return res.json({
        message: 'Bank details verified.',
        bankDetails: toAdminBankDetailsShape({ source: 'kyc', doc: kyc }),
      });
    }

    // legacy path — unchanged behavior for old vendors
    vendor.bankDetails.verified = true;
    vendor.bankDetails.status = 'Verified';
    vendor.bankDetails.rejectionReason = '';
    vendor.bankDetails.reviewedAt = new Date();
    vendor.bankDetails.reviewedBy = reviewedBy;
    await vendor.save();

    res.json({
      message: 'Bank details verified.',
      bankDetails: toAdminBankDetailsShape({ source: 'legacy', doc: vendor }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /admin/vendors/:vendorId/bank-reject
// Admin rejects whichever record is the vendor's current live bank submission
// ─────────────────────────────────────────────────────────────────────────────
export const rejectVendorBankDetails = async (req, res) => {
  try {
    // const { vendorId } = req.params;
    // const { reason } = req.body;

    // if (!reason || !reason.trim()) {
    //   return res.status(400).json({ message: 'Rejection reason is required.' });
    // }
    const { vendorId } = req.params;
    const reason = (req.body?.reason || 'Rejected by admin').trim();

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    const resolved = await resolveVendorBankSource(vendor);
    if (!resolved) {
      return res
        .status(404)
        .json({ message: 'Bank details not found for this vendor.' });
    }

    const reviewedBy = req.admin?._id || req.admin?.id || 'admin';

    if (resolved.source === 'bankAccount') {
      const account = resolved.doc;
      account.verified = false;
      account.status = 'Rejected';
      account.rejectionReason = reason.trim();
      account.reviewedAt = new Date();
      account.reviewedBy = reviewedBy;
      await account.save();
      return res.json({
        message: 'Bank details rejected.',
        bankDetails: toAdminBankDetailsShape({
          source: 'bankAccount',
          doc: account,
        }),
      });
    }

    // if (resolved.source === 'kyc') {
    //   const kyc = resolved.doc;
    //   kyc.bankDetails.verified = false;
    //   kyc.bankDetails.status = 'Rejected';
    //   kyc.bankDetails.rejectionReason = reason.trim();
    //   kyc.bankDetails.reviewedAt = new Date();
    //   kyc.bankDetails.reviewedBy = reviewedBy;
    //   await kyc.save();
    //   return res.json({
    //     message: 'Bank details rejected.',
    //     bankDetails: toAdminBankDetailsShape({ source: 'kyc', doc: kyc }),
    //   });
    // }
    if (resolved.source === 'kyc') {
      const kyc = resolved.doc;
      // Bank details submitted as part of a KYC application should be
      // reviewed together with that KYC — don't allow verifying the bank
      // alone while the KYC itself is still pending/rejected.
      if (kyc.status !== 'approved') {
        return res.status(400).json({
          message:
            "Please approve this vendor's KYC application first — bank details are verified automatically once KYC is approved.",
        });
      }
      kyc.bankDetails.verified = true;
      kyc.bankDetails.status = 'Verified';
      kyc.bankDetails.rejectionReason = '';
      kyc.bankDetails.reviewedAt = new Date();
      kyc.bankDetails.reviewedBy = reviewedBy;
      await kyc.save();
      return res.json({
        message: 'Bank details verified.',
        bankDetails: toAdminBankDetailsShape({ source: 'kyc', doc: kyc }),
      });
    }

    // legacy path — unchanged behavior for old vendors
    vendor.bankDetails.verified = false;
    vendor.bankDetails.status = 'Rejected';
    vendor.bankDetails.rejectionReason = reason.trim();
    vendor.bankDetails.reviewedAt = new Date();
    vendor.bankDetails.reviewedBy = reviewedBy;
    await vendor.save();

    res.json({
      message: 'Bank details rejected.',
      bankDetails: toAdminBankDetailsShape({ source: 'legacy', doc: vendor }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const getVendorMySettlements = async (req, res) => {
//   try {
//     const vendorId = req.vendor?._id || req.vendor?.id;
//     // const settlements = await Settlement.find({ vendorId })
//     //   .sort({ createdAt: -1 })
//     //   .lean();
//     const settlements = await Settlement.find({ vendorId })
//       .populate('orderId', 'orderNumber')
//       .sort({ createdAt: -1 })
//       .lean();

//     const totalPending = settlements
//       .filter((s) => s.status === 'Pending')
//       .reduce((a, s) => a + s.netPayout, 0);

//     const totalPaid = settlements
//       .filter((s) => s.status === 'Paid')
//       .reduce((a, s) => a + s.netPayout, 0);

//     res.json({
//       settlements,
//       summary: { totalPending, totalPaid },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const getVendorMySettlements = async (req, res) => {
  try {
    // const vendorId = req.vendor?._id || req.vendor?.id;
    // const settlements = await Settlement.find({ vendorId })
    //   .populate('orderId', 'orderNumber')
    //   .sort({ createdAt: -1 })
    //   .lean();
    const vendorId = req.vendor?._id || req.vendor?.id;

    // Create settlements as soon as a delivered/completed line exists for
    // this vendor, instead of waiting for the admin dashboard to trigger the
    // same upsert. $setOnInsert means an already-created settlement (from
    // admin or a prior call) is left untouched — purely additive.
    const categories = await Category.find()
      .select('name commissionRate')
      .lean();
    const rateMap = new Map(
      categories.map((c) => [c.name, Number(c.commissionRate) || 0]),
    );
    const SETTLEABLE = ['delivered', 'completed'];

    const vendorOrders = await Order.find({}).populate({
      path: 'products.product',
      select: PRODUCT_SETTLEMENT_SELECT,
    });

    for (const order of vendorOrders) {
      for (const line of order.products || []) {
        const product = line.product;
        if (!product || typeof product === 'string') continue;
        if (String(product.vendorId) !== String(vendorId)) continue;
        if (!SETTLEABLE.includes(line.lineStatus)) continue;
        if (line.productType !== 'Rental') continue;

        const money = settlementMoneyFromLine(line, rateMap, order);
        if (!money.grossAmount) continue;

        const existing = await Settlement.findOne({
          orderId: order._id,
          vendorId,
          lineId: line._id,
        }).select('status');
        if (existing?.status === 'Paid') continue;

        await Settlement.findOneAndUpdate(
          { orderId: order._id, vendorId, lineId: line._id },
          {
            $setOnInsert: {
              orderId: order._id,
              vendorId,
              vendorName: req.vendor?.fullName || 'Unknown Vendor',
              lineId: line._id,
              status: 'Pending',
            },
            $set: {
              period: getPeriodLabel(order.createdAt),
              grossAmount: money.grossAmount,
              depositAmount: money.depositAmount,
              platformFee: money.platformFee,
              netPayout: money.netPayout,
            },
          },
          { upsert: true, new: true },
        );
      }
    }

    const settlements = await Settlement.find({ vendorId })
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .lean();

    // Build orderId+lineId -> refund lookup (same logic as admin settlements),
    // computed live from Order.products[].returnRequest, so a vendor's
    // displayed/PDF net payout always reflects the refund's current status.
    const orderIds = [
      ...new Set(settlements.map((s) => String(s.orderId?._id || s.orderId))),
    ];
    const refundOrders = await Order.find({ _id: { $in: orderIds } }).select(
      'products',
    );
    const refundMap = new Map();
    for (const order of refundOrders) {
      for (const line of order.products || []) {
        const rr = line?.returnRequest;
        if (!rr?.refundInitiatedAt) continue;
        const refundStatus = rr.refundApprovedAt
          ? 'approved'
          : rr.refundRejectedAt
            ? 'rejected'
            : 'pending';
        let refundAmount = 0;
        if (refundStatus === 'approved') {
          refundAmount = Math.max(0, Number(rr.finalRefundAmount || 0));
        } else if (refundStatus === 'rejected') {
          refundAmount = Math.max(0, Number(line?.refundableDeposit || 0));
        }
        refundMap.set(`${order._id}_${line._id}`, {
          refundAmount,
          refundStatus,
        });
      }
    }

    // const result = settlements.map((s) => {
    //   const orderIdRaw = String(s.orderId?._id || s.orderId);
    //   const refund = refundMap.get(`${orderIdRaw}_${s.lineId}`);
    //   const refundAmount = refund ? refund.refundAmount : 0;
    //   const refundStatus = refund ? refund.refundStatus : null;
    //   return {
    //     ...s,
    //     refundAmount,
    //     refundStatus,
    //     netPayout: Math.max(0, s.netPayout - refundAmount),
    //   };
    // });

    // Same global, per-GROUP (vendorId+period) sequential numbering as the
    // admin side — computed across ALL settlements (not just this vendor's),
    // so the same underlying period-group shows the identical ID everywhere.
    const allAsc = await Settlement.find()
      .select('_id vendorId period createdAt')
      .sort({ createdAt: 1, _id: 1 })
      .lean();
    const groupNumberMap = new Map();
    const settlementNumberMap = new Map();
    let nextGroupNumber = 1;
    for (const s of allAsc) {
      const groupKey = `${s.vendorId}-${s.period}`;
      if (!groupNumberMap.has(groupKey)) {
        groupNumberMap.set(groupKey, nextGroupNumber);
        nextGroupNumber += 1;
      }
      settlementNumberMap.set(String(s._id), groupNumberMap.get(groupKey));
    }

    const result = settlements.map((s) => {
      const orderIdRaw = String(s.orderId?._id || s.orderId);
      const refund = refundMap.get(`${orderIdRaw}_${s.lineId}`);
      const refundAmount = refund ? refund.refundAmount : 0;
      const refundStatus = refund ? refund.refundStatus : null;
      return {
        ...s,
        settlementId: `SET-${String(
          settlementNumberMap.get(String(s._id)) || 0,
        ).padStart(4, '0')}`,
        refundAmount,
        refundStatus,
        netPayout: Math.max(0, s.netPayout - refundAmount),
      };
    });

    const totalPending = result
      .filter((s) => s.status === 'Pending')
      .reduce((a, s) => a + s.netPayout, 0);

    const totalPaid = result
      .filter((s) => s.status === 'Paid')
      .reduce((a, s) => a + s.netPayout, 0);

    res.json({
      settlements: result,
      summary: { totalPending, totalPaid },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
