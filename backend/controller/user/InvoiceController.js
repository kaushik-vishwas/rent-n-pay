import Order from '../../models/Order.js';
import {
  buildGlobalInvoiceNumberMap,
  formatDisplayInvoiceNo,
} from '../../utils/invoiceNumbering.js';

export const getMyInvoices = async (req, res) => {
  try {
    const userId = req.user?._id;
    const orders = await Order.find({ user: userId })
      .populate('products.product', 'productName')
      .sort({ createdAt: -1 })
      .lean();

    // Same global sequence the Admin Invoices table uses, so both sides
    // always show the identical INV-0005 style number for the same order.
    const globalInvoiceNumberMap = await buildGlobalInvoiceNumberMap();

    const invoices = orders.map((o) => {
      // const shortId = String(o._id).slice(-6).toUpperCase();
      // const lines = Array.isArray(o.products) ? o.products : [];
      const shortId = String(o._id).slice(-6).toUpperCase();
      // Same ORD-0001 format used across Admin/Vendor/User Orders tables,
      // built from the order's real sequential orderNumber, so it matches
      // the Admin Invoices panel exactly.
      const orderRef = `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`;
      const lines = Array.isArray(o.products) ? o.products : [];
      const items =
        lines
          .map((p) => p?.product?.productName)
          .filter(Boolean)
          .join(', ') || 'Rental order';

      // TEMP DEBUG - remove after confirming root cause
      console.log('Invoice debug:', {
        orderId: o._id,
        name: o.name,
        phone: o.phone,
        address: o.address,
        productsCount: lines.length,
        rawProducts: JSON.stringify(lines),
      });

      const invoiceKey = `INV-${shortId}`;

      // return {
      //   _id: o._id,

      //   invoiceId: `#${formatDisplayInvoiceNo(invoiceKey, globalInvoiceNumberMap)}`,
      //   orderRef,
      return {
        _id: o._id,
        invoiceId: `INV-${String(o.orderNumber || 0).padStart(4, '0')}`,
        orderRef,
        date: o.createdAt,
        item: items,
        lineItems: lines.map((p) => ({
          productName: p?.product?.productName || 'Item',
          quantity: Number(p?.quantity || 0),
          pricePerDay: Number(p?.pricePerDay || 0),
          productType: p?.productType || 'Rental',
        })),
        name: o.name || '—',
        phone: o.phone || '—',
        address: o.address || '—',
        // amount: Number(o.totalAmount || 0),
        // baseRentalCost: Number(o.baseRentalCost || 0),
        // gst: Number(o.gst || 0),
        // careTax: Number(o.careProtection || 0),
        // deposit: Number(o.refundableDeposit || 0),
        // deliveryFee: Number(o.deliveryFee || 0),
        // discountAmount: Number(o.discountAmount || 0),
        // status: o.status,
        amount: Number(o.totalAmount || 0),
        baseRentalCost: Number(o.baseRentalCost || 0),
        gst: Number(o.gst || 0),
        careTax: Number(o.careProtection || 0),
        deposit: Number(o.refundableDeposit || 0),
        deliveryFee: Number(o.deliveryFee || 0),
        deliveryPackaging: Number(o.deliveryPackaging || 0),
        installationFee: Number(o.installationFee || 0),
        platformFee: Number(o.platformFee || 0),
        relocationWarranty: Number(o.relocationWarranty || 0),
        repairWarranty: Number(o.repairWarranty || 0),
        discountAmount: Number(o.discountAmount || 0),
        status: o.status,
      };
    });

    return res.json({ invoices });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// export const getMyInvoices = async (req, res) => {
//   try {
//     const userId = req.user?._id;

//     // Fetch ALL orders (not just this user's) so the global sequential
//     // invoice numbering (INV-0001, INV-0002...) stays identical to what
//     // the Admin Invoices panel shows for the same order/month — then we
//     // filter down to just this user's rows before responding.
//     const allOrders = await Order.find({})
//       .populate('products.product', 'productName')
//       .sort({ createdAt: 1 })
//       .lean();

//     // Build one entry per rental month (mirrors Admin's per-month split)
//     // across ALL orders, so numbering matches Admin exactly.
//     const allMonthEntries = [];
//     allOrders.forEach((o) => {
//       const orderRef = `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`;
//       const lines = Array.isArray(o.products) ? o.products : [];
//       const items =
//         lines
//           .map((p) => p?.product?.productName)
//           .filter(Boolean)
//           .join(', ') || 'Rental order';

//       lines.forEach((productEntry) => {
//         const lineProductType = productEntry.productType || 'Rental';
//         const isRentalLine = String(lineProductType).toLowerCase() === 'rental';
//         const lineRentalDuration = Number(
//           productEntry.rentalDuration ?? o.rentalDuration ?? 1,
//         );
//         const isMonthlyRental =
//           isRentalLine &&
//           String(
//             productEntry.tenureUnit || o.tenureUnit || '',
//           ).toLowerCase() === 'month' &&
//           lineRentalDuration > 1;
//         const totalMonths = isMonthlyRental ? lineRentalDuration : 1;

//         // Same Paid/Pending logic Admin uses: months already paid come
//         // from monthsPaid (per-line, falling back to order-level), the
//         // rest are Pending. For non-monthly lines, fall back to the
//         // order's own delivered/confirmed status.
//         const isOrderPaid = ['delivered', 'confirmed'].includes(
//           String(o.status || '').toLowerCase(),
//         );
//         const monthsPaidSoFar = Number(
//           productEntry.monthsPaid ?? o.monthsPaid ?? 1,
//         );

//         for (let monthIdx = 0; monthIdx < totalMonths; monthIdx++) {
//           const dueDate = new Date(o.createdAt);
//           dueDate.setMonth(dueDate.getMonth() + monthIdx);

//           const monthStatus = isMonthlyRental
//             ? monthIdx < monthsPaidSoFar
//               ? 'Paid'
//               : 'Pending'
//             : isOrderPaid
//               ? 'Paid'
//               : 'Pending';

//           allMonthEntries.push({
//             orderId: o._id,
//             orderRef,
//             userId: o.user,
//             date: dueDate,
//             monthIdx,
//             totalMonths,
//             isMonthlyRental,
//             monthStatus,
//             items,
//             order: o,
//           });
//         }
//       });
//     });

//     // Assign the same "contiguous per order, ordered by date" numbering
//     // pattern used on the Admin side.
//     let counter = 1;
//     const displayNoById = new Map();
//     const grouped = new Map();
//     allMonthEntries.forEach((e) => {
//       const key = String(e.orderId);
//       if (!grouped.has(key)) grouped.set(key, []);
//       grouped.get(key).push(e);
//     });
//     const orderedGroups = [...grouped.entries()].sort((a, b) => {
//       const minA = Math.min(...a[1].map((e) => e.date.getTime()));
//       const minB = Math.min(...b[1].map((e) => e.date.getTime()));
//       return minA - minB;
//     });
//     orderedGroups.forEach(([, entries]) => {
//       entries
//         .sort((a, b) => a.monthIdx - b.monthIdx)
//         .forEach((e) => {
//           displayNoById.set(`${e.orderId}-${e.monthIdx}`, counter);
//           counter += 1;
//         });
//     });

//     // Build the response, filtered to this user only.
//     const invoices = allMonthEntries
//       .filter((e) => String(e.userId) === String(userId))
//       .map((e) => {
//         const o = e.order;
//         const invNum = displayNoById.get(`${e.orderId}-${e.monthIdx}`);
//         return {
//           _id: `${o._id}-${e.monthIdx}`,
//           invoiceId: `INV-${String(invNum).padStart(4, '0')}`,
//           orderRef: e.orderRef,
//           date: e.date,
//           item: e.items,
//           tenure: e.isMonthlyRental
//             ? `Month ${e.monthIdx + 1} of ${e.totalMonths}`
//             : '',
//           lineItems: (Array.isArray(o.products) ? o.products : []).map((p) => ({
//             productName: p?.product?.productName || 'Item',
//             quantity: Number(p?.quantity || 0),
//             pricePerDay: Number(p?.pricePerDay || 0),
//             productType: p?.productType || 'Rental',
//           })),
//           // name: o.name || '—',
//           // phone: o.phone || '—',
//           // address: o.address || '—',
//           // amount: Number(o.totalAmount || 0),
//           // baseRentalCost: Number(o.baseRentalCost || 0),
//           name: o.name || '—',
//           phone: o.phone || '—',
//           address: o.address || '—',
//           amount:
//             Number(o.baseRentalCost || 0) +
//             Number(o.gst || 0) +
//             Number(o.careProtection || 0),
//           baseRentalCost: Number(o.baseRentalCost || 0),
//           gst: Number(o.gst || 0),
//           careTax: Number(o.careProtection || 0),
//           deposit: Number(o.refundableDeposit || 0),
//           deliveryFee: Number(o.deliveryFee || 0),
//           deliveryPackaging: Number(o.deliveryPackaging || 0),
//           installationFee: Number(o.installationFee || 0),
//           platformFee: Number(o.platformFee || 0),
//           relocationWarranty: Number(o.relocationWarranty || 0),
//           repairWarranty: Number(o.repairWarranty || 0),
//           discountAmount: Number(o.discountAmount || 0),
//           status: e.monthStatus,
//         };
//       })
//       .sort((a, b) => new Date(b.date) - new Date(a.date));

//     return res.json({ invoices });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };
