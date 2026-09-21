// import Order from '../../models/Order.js';
// import UserKyc from '../../models/UserKyc.js';
// import User from '../../models/userAuthModel.js';
// import StockNotify from '../../models/StockNotify.js';

// function orderShortRef(orderId) {
//   const s = String(orderId);
//   return s.length > 6 ? s.slice(-6).toUpperCase() : s.toUpperCase();
// }

// function startOfDay(d) {
//   const x = new Date(d);
//   x.setHours(0, 0, 0, 0);
//   return x;
// }

// function resolveTenureUnit(order) {
//   if (order.tenureUnit === 'day') return 'day';
//   if (order.tenureUnit === 'month') return 'month';
//   return 'month';
// }

// function computeLeaseEnd(start, durationRaw, unit) {
//   const n = Math.max(1, Number(durationRaw || 1));
//   const d = new Date(start.getTime());
//   if (unit === 'day') d.setDate(d.getDate() + n);
//   else d.setMonth(d.getMonth() + n);
//   return d;
// }

// /**
//  * Latest activity for the logged-in customer (merged, sorted by time).
//  * GET /users/notifications
//  */
// export async function getUserNotifications(req, res) {
//   try {
//     const userId = req.user._id;

//     const user = await User.findById(userId)
//       .select('createdAt fullName')
//       .lean();

//     const [kyc, orders] = await Promise.all([
//       UserKyc.findOne({ userId }).lean(),
//       Order.find({ user: userId })
//         .populate('products.product', 'productName')
//         .sort({ updatedAt: -1 })
//         .limit(25)
//         .lean(),
//     ]);

//     const items = [];

//     if (user?.createdAt) {
//       items.push({
//         id: `welcome-${userId}`,
//         type: 'welcome',
//         title: 'Welcome to Rentnpay',
//         detail:
//           'Your account is ready. Explore rentals and track orders from My Orders.',
//         href: '/rent',
//         at: user.createdAt,
//       });
//     }

//     if (kyc?.status === 'approved') {
//       const at = kyc.reviewedAt || kyc.updatedAt || kyc.submittedAt;
//       if (at) {
//         items.push({
//           id: `kyc-approved-${kyc._id}`,
//           type: 'kyc',
//           title: 'KYC verified',
//           detail:
//             'Your identity documents were approved. You can continue with your shopping.',
//           href: '/orders',
//           at,
//         });
//       }
//     } else if (kyc?.status === 'rejected') {
//       const at = kyc.reviewedAt || kyc.updatedAt || kyc.submittedAt;
//       if (at) {
//         const reason = String(kyc.rejectionReason || '').trim();
//         items.push({
//           id: `kyc-rejected-${kyc._id}-${String(at)}`,
//           type: 'kyc',
//           title: 'KYC rejected by admin',
//           detail: reason
//             ? `Your KYC was rejected by admin. Reason: ${reason}`
//             : 'Your KYC was rejected by admin. Please re-upload clear documents.',
//           href: '/profile?kyc=update',
//           at,
//         });
//       }
//     } else if (kyc?.status === 'pending' && kyc.submittedAt) {
//       items.push({
//         id: `kyc-pending-${kyc._id}`,
//         type: 'kyc',
//         title: 'KYC under review',
//         detail:
//           'We received your documents. Verification usually completes within 24–48 hours.',
//         href: '/orders',
//         at: kyc.submittedAt,
//       });
//     }

//     const today = startOfDay(new Date());

//     for (const o of orders) {
//       if (!o.createdAt) continue;
//       const ref = orderShortRef(o._id);
//       const st = String(o.status || '').toLowerCase();
//       const oid = String(o._id);

//       items.push({
//         id: `order-${oid}-placed`,
//         type: 'order',
//         title: 'Order placed',
//         detail: `Order #${ref} was confirmed.`,
//         href: '/my-account?tab=orders',
//         orderId: oid,
//         at: o.createdAt,
//       });

//       if (st === 'shipped' && o.updatedAt) {
//         items.push({
//           id: `order-${oid}-shipped`,
//           type: 'order',
//           title: 'Order shipped',
//           detail: `Order #${ref} is on the way. Track live status anytime.`,
//           href: `/orders/${oid}/track`,
//           orderId: oid,
//           at: o.updatedAt,
//         });
//       }

//       if (st === 'delivered') {
//         const start = new Date(o.createdAt);
//         const unit = resolveTenureUnit(o);
//         const leaseEnd = computeLeaseEnd(start, o.rentalDuration, unit);
//         const daysLeft = Math.ceil(
//           (startOfDay(leaseEnd).getTime() - today.getTime()) / 86400000,
//         );
//         if (daysLeft > 0 && daysLeft <= 3) {
//           items.push({
//             id: `tenure-${oid}`,
//             type: 'tenure',
//             title: 'Rental ending soon',
//             detail: `Order #${ref}: ${daysLeft} day${
//               daysLeft === 1 ? '' : 's'
//             } left on your rental period.`,
//             href: '/my-account?tab=manage-rental-items',
//             orderId: oid,
//             at: leaseEnd,
//           });
//         }
//       }
//     }

//     // Stock-back-in notifications
//     const stockNotifs = await StockNotify.find({ userId, notified: true })
//       .populate('productId', 'productName')
//       .sort({ updatedAt: -1 })
//       .limit(5)
//       .lean();

//     for (const sn of stockNotifs) {
//       const p = sn.productId;
//       if (!p) continue;
//       items.push({
//         id: `stock-notify-${sn._id}`,
//         type: 'stock',
//         title: 'Product back in stock!',
//         detail: `${p.productName} is now available. Grab it before it runs out!`,
//         href: `/rent-product-details/${p._id}`,
//         at: sn.updatedAt,
//       });
//     }

//     items.sort((a, b) => new Date(b.at) - new Date(a.at));

//     const seen = new Set();
//     const deduped = [];
//     for (const row of items) {
//       if (seen.has(row.id)) continue;
//       seen.add(row.id);
//       deduped.push(row);
//     }

//     const notifications = deduped.slice(0, 7).map((n) => ({
//       id: n.id,
//       type: n.type,
//       title: n.title,
//       detail: n.detail,
//       href: n.href || '',
//       at: n.at instanceof Date ? n.at.toISOString() : n.at,
//       ...(n.orderId ? { orderId: n.orderId } : {}),
//     }));

//     res.json({
//       notifications,
//       count: notifications.length,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: err.message || 'Failed to load notifications',
//     });
//   }
// }

// export async function requestStockNotify(req, res) {
//   try {
//     const userId = req.user._id;
//     const { productId } = req.body;

//     if (!productId) {
//       return res.status(400).json({ message: 'productId is required' });
//     }

//     // Upsert — safe if already exists
//     await StockNotify.findOneAndUpdate(
//       { userId, productId },
//       { userId, productId, notified: false },
//       { upsert: true, new: true },
//     );

//     res.json({ success: true, alreadyRequested: false });
//   } catch (err) {
//     // Duplicate key = already requested
//     if (err.code === 11000) {
//       return res.json({ success: true, alreadyRequested: true });
//     }
//     res
//       .status(500)
//       .json({ message: err.message || 'Failed to register notify request' });
//   }
// }

import Order from '../../models/Order.js';
import UserKyc from '../../models/UserKyc.js';
import User from '../../models/userAuthModel.js';
import StockNotify from '../../models/StockNotify.js';

// function orderShortRef(orderId) {
//   const s = String(orderId);
//   return s.length > 6 ? s.slice(-6).toUpperCase() : s.toUpperCase();
// }
function orderShortRef(orderNumber) {
  return String(orderNumber || 0).padStart(4, '0');
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function resolveTenureUnit(order) {
  if (order.tenureUnit === 'day') return 'day';
  if (order.tenureUnit === 'month') return 'month';
  return 'month';
}

function computeLeaseEnd(start, durationRaw, unit) {
  const n = Math.max(1, Number(durationRaw || 1));
  const d = new Date(start.getTime());
  if (unit === 'day') d.setDate(d.getDate() + n);
  else d.setMonth(d.getMonth() + n);
  return d;
}

/**
 * Latest activity for the logged-in customer (merged, sorted by time).
 * GET /users/notifications
 */
export async function getUserNotifications(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select('createdAt fullName')
      .lean();

    const [kyc, orders] = await Promise.all([
      UserKyc.findOne({ userId }).lean(),
      // Order.find({ user: userId })
      //   .populate('products.product', 'productName')
      //   .sort({ updatedAt: -1 })
      //   .limit(25)
      //   .lean(),
      Order.find({ user: userId })
        .select('+orderNumber')
        .populate('products.product', 'productName')
        .sort({ updatedAt: -1 })
        .limit(25)
        .lean(),
    ]);

    const items = [];

    if (user?.createdAt) {
      items.push({
        id: `welcome-${userId}`,
        type: 'welcome',
        title: 'Welcome to Rentnpay',
        detail:
          'Your account is ready. Explore rentals and track orders from My Orders.',
        href: '/rent',
        at: user.createdAt,
      });
    }

    if (kyc?.status === 'approved') {
      const at = kyc.reviewedAt || kyc.updatedAt || kyc.submittedAt;
      if (at) {
        items.push({
          id: `kyc-approved-${kyc._id}`,
          type: 'kyc',
          title: 'KYC verified',
          detail:
            'Your identity documents were approved. You can continue with your shopping.',
          href: '/my-account?tab=orders',
          at,
        });
      }
    } else if (kyc?.status === 'rejected') {
      const at = kyc.reviewedAt || kyc.updatedAt || kyc.submittedAt;
      if (at) {
        const reason = String(kyc.rejectionReason || '').trim();
        items.push({
          id: `kyc-rejected-${kyc._id}-${String(at)}`,
          type: 'kyc',
          title: 'KYC rejected by admin',
          detail: reason
            ? `Your KYC was rejected by admin. Please re-submit.`
            : 'Your KYC was rejected by admin. Please re-submit.',
          href: '/my-account?tab=profile',
          at,
        });
      }
    } else if (kyc?.status === 'pending' && kyc.submittedAt) {
      items.push({
        id: `kyc-pending-${kyc._id}`,
        type: 'kyc',
        title: 'KYC under review',
        detail:
          'We received your documents. Verification usually completes within 24–48 hours.',
        href: '/my-account?tab=orders',
        at: kyc.submittedAt,
      });
    }

    const today = startOfDay(new Date());

    // for (const o of orders) {
    //   if (!o.createdAt) continue;
    //   const ref = orderShortRef(o._id);
    //   const st = String(o.status || '').toLowerCase();
    //   const oid = String(o._id);

    //   items.push({
    //     id: `order-${oid}-placed`,
    //     type: 'order',
    //     title: 'Order placed',
    //     detail: `Order #${ref} was confirmed.`,
    //     href: '/my-account?tab=orders',
    //     orderId: oid,
    //     at: o.createdAt,
    //   });
    for (const o of orders) {
      if (!o.createdAt) continue;
      const ref = orderShortRef(o.orderNumber);
      const st = String(o.status || '').toLowerCase();
      const oid = String(o._id);

      items.push({
        id: `order-${oid}-placed`,
        type: 'order',
        title: 'Order placed',
        detail: `Order #ORD-${ref} was placed.`,
        href: '/my-account?tab=orders',
        orderId: oid,
        at: o.createdAt,
      });

      // if (st === 'shipped' && o.updatedAt) {
      //   items.push({
      //     id: `order-${oid}-shipped`,
      //     type: 'order',
      //     title: 'Order shipped',
      //     detail: `Order #${ref} is on the way. Track live status anytime.`,
      //     href: `/orders/${oid}/track`,
      //     orderId: oid,
      //     at: o.updatedAt,
      //   });
      // }
      if (st === 'shipped' && o.updatedAt) {
        items.push({
          id: `order-${oid}-shipped`,
          type: 'order',
          title: 'Order shipped',
          detail: `Order #ORD-${ref} is on the way. Track live status anytime.`,
          href: `/orders/${oid}/track`,
          orderId: oid,
          at: o.updatedAt,
        });
      }

      const vendorCancelledLine = (o.products || []).find(
        (line) =>
          line?.lineStatus === 'cancelled' && line?.cancelledBy === 'vendor',
      );
      if (vendorCancelledLine) {
        const productName =
          vendorCancelledLine?.product?.productName || 'your product';
        items.push({
          id: `vendor-cancel-${oid}-${String(vendorCancelledLine._id || '')}`,
          type: 'order',
          title: 'Order cancelled by vendor',
          detail: `Your order #ORD-${ref} for ${productName} was cancelled by the vendor. A full refund has been initiated.`,
          href: '/my-account?tab=orders',
          orderId: oid,
          at: vendorCancelledLine.cancelledAt || o.updatedAt || o.createdAt,
        });
      }

      const kycBlockedLine = (o.products || []).find(
        (line) => line?.deliveryBlockedByKyc === true,
      );
      const currentKycStatus = String(kyc?.status || 'not_submitted');
      if (kycBlockedLine && currentKycStatus !== 'approved') {
        const isAwaitingReview =
          currentKycStatus === 'pending' || currentKycStatus === 'in_review';
        items.push({
          id: `kyc-required-${oid}`,
          type: 'kyc',
          title: isAwaitingReview
            ? 'KYC Verification Pending'
            : 'KYC Required for Delivery',
          detail: isAwaitingReview
            ? `Your order #ORD-${ref} is ready for delivery.Your KYC is under review. Delivery will proceed once it is approved.`
            : `Your order #ORD-${ref} is ready for delivery. Please complete your KYC to receive the product.`,
          href: isAwaitingReview
            ? '/my-account?tab=orders'
            : '/my-account?tab=profile',
          orderId: oid,
          at: o.updatedAt || o.createdAt,
        });
      }

      if (st === 'delivered') {
        const start = new Date(o.createdAt);
        const unit = resolveTenureUnit(o);
        const leaseEnd = computeLeaseEnd(start, o.rentalDuration, unit);
        const daysLeft = Math.ceil(
          (startOfDay(leaseEnd).getTime() - today.getTime()) / 86400000,
        );
        if (daysLeft > 0 && daysLeft <= 3) {
          // items.push({
          //   id: `tenure-${oid}`,
          //   type: 'tenure',
          //   title: 'Rental ending soon',
          //   detail: `Order #${ref}: ${daysLeft} day${
          //     daysLeft === 1 ? '' : 's'
          //   } left on your rental period.`,
          //   href: '/my-account?tab=manage-rental-items',
          //   orderId: oid,
          //   at: leaseEnd,
          // });
          items.push({
            id: `tenure-${oid}`,
            type: 'tenure',
            title: 'Rental ending soon',
            detail: `Order #ORD-${ref}: ${daysLeft} day${
              daysLeft === 1 ? '' : 's'
            } left on your rental period.`,
            href: '/my-account?tab=manage-rental-items',
            orderId: oid,
            at: leaseEnd,
          });
        }
      }
    }

    // Stock-back-in notifications
    const stockNotifs = await StockNotify.find({ userId, notified: true })
      .populate('productId', 'productName')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    for (const sn of stockNotifs) {
      const p = sn.productId;
      if (!p) continue;
      items.push({
        id: `stock-notify-${sn._id}`,
        type: 'stock',
        title: 'Product back in stock!',
        detail: `${p.productName} is now available. Grab it before it runs out!`,
        href: `/rent-product-details/${p._id}`,
        at: sn.updatedAt,
      });
    }

    items.sort((a, b) => new Date(b.at) - new Date(a.at));

    const seen = new Set();
    const deduped = [];
    for (const row of items) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      deduped.push(row);
    }

    const notifications = deduped.slice(0, 7).map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      detail: n.detail,
      href: n.href || '',
      at: n.at instanceof Date ? n.at.toISOString() : n.at,
      ...(n.orderId ? { orderId: n.orderId } : {}),
    }));

    res.json({
      notifications,
      count: notifications.length,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Failed to load notifications',
    });
  }
}

export async function requestStockNotify(req, res) {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    // Upsert — safe if already exists
    await StockNotify.findOneAndUpdate(
      { userId, productId },
      { userId, productId, notified: false },
      { upsert: true, new: true },
    );

    res.json({ success: true, alreadyRequested: false });
  } catch (err) {
    // Duplicate key = already requested
    if (err.code === 11000) {
      return res.json({ success: true, alreadyRequested: true });
    }
    res
      .status(500)
      .json({ message: err.message || 'Failed to register notify request' });
  }
}
