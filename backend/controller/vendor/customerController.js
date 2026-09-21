import mongoose from 'mongoose';
// import Order from '../../models/Order.js';
import Order from '../../models/Order.js';
import ServiceBooking from '../../models/ServiceBooking.js';
import Product from '../../models/Product.js';
import User from '../../models/userAuthModel.js';
import UserKyc from '../../models/UserKyc.js';
import Address from '../../models/Address.js';
import { buildMyRentalsStyleActiveRows } from '../../utils/userRentalHubActiveRows.js';
import { buildIssueTicketsFromOrders } from '../admin/ticketAdminController.js';
import Category from '../../models/Category.js';
import {
  buildCategoryRateMap,
  computeVendorLineMoney,
} from '../../utils/vendorPayout.js';

function filterOrderToVendorProducts(order, productIds) {
  const lines = (order.products || []).filter((it) =>
    productIds.includes(String(it.product?._id || it.product)),
  );
  if (!lines.length) return null;
  return { ...order, products: lines };
}

async function enrichCustomersWithKycPhones(customers) {
  const userIds = customers.map((c) => c._id).filter(Boolean);
  const oidList = userIds
    .filter((id) => mongoose.Types.ObjectId.isValid(String(id)))
    .map((id) => new mongoose.Types.ObjectId(String(id)));
  if (!oidList.length) return;

  const [kycRows, addressPhones, orderPhones] = await Promise.all([
    UserKyc.find({ userId: { $in: oidList } })
      .select('userId contactNumber')
      .lean(),
    Address.aggregate([
      { $match: { user: { $in: oidList } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$user', phone: { $first: '$phone' } } },
    ]),
    Order.aggregate([
      { $match: { user: { $in: oidList } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$user', phone: { $first: '$phone' } } },
    ]),
  ]);

  const kycByUser = new Map(
    kycRows.map((k) => [
      String(k.userId),
      String(k.contactNumber || '').trim(),
    ]),
  );
  const addressPhoneByUser = new Map(
    addressPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
  );
  const orderPhoneByUser = new Map(
    orderPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
  );

  for (const c of customers) {
    const uid = String(c._id);
    c.kycMobile =
      kycByUser.get(uid) ||
      addressPhoneByUser.get(uid) ||
      orderPhoneByUser.get(uid) ||
      '';
  }
}

export const getVendorCustomersSummary = async (req, res) => {
  try {
    const vendorId = req.vendor?._id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Vendor not authenticated' });
    }

    const vendorProducts = await Product.find({ vendorId }).select(
      '_id productName category type price condition rentalConfigurations createdVia salesConfiguration variants',
    );
    const productIds = vendorProducts.map((p) => String(p._id));
    const productMap = new Map(vendorProducts.map((p) => [String(p._id), p]));

    if (!productIds.length) {
      return res.json({
        customers: [],
        totals: {
          totalCustomers: 0,
          topCustomers: 0,
          revenue: 0,
          avgTenureMonths: 0,
          service: 0,
          newBuy: 0,
          usedBuy: 0,
          mintBuy: 0,
          rent: 0,
          deposit: 0,
          shipping: 0,
          lifetime: 0,
        },
      });
    }

    // const orders = await Order.find({
    //   'products.product': { $in: productIds },
    // })
    //   .populate('user', 'fullName emailAddress')
    //   .populate('products.product', 'productName')
    //   .sort({ createdAt: -1 });

    // const byCustomer = new Map();
    // const orders = await Order.find({
    //   'products.product': { $in: productIds },
    // })
    //   .populate('user', 'fullName emailAddress')
    //   .populate('products.product', 'productName')
    //   .sort({ createdAt: -1 });

    // const serviceBookings = await ServiceBooking.find({ vendor: vendorId })
    //   .populate('user', 'fullName emailAddress')
    //   .sort({ createdAt: -1 });

    // const orders = await Order.find({
    //   'products.product': { $in: productIds },
    // })
    //   .populate('user', 'fullName emailAddress mobileNumber')
    //   .populate('products.product', 'productName')
    //   .sort({ createdAt: -1 });

    // const serviceBookings = await ServiceBooking.find({ vendor: vendorId })
    //   .populate('user', 'fullName emailAddress mobileNumber')
    //   .sort({ createdAt: -1 });

    // const orders = await Order.find({
    //   'products.product': { $in: productIds },
    // })
    //   .populate('user', 'fullName emailAddress mobileNumber createdAt')
    //   .populate('products.product', 'productName')
    //   .sort({ createdAt: -1 });
    const orders = await Order.find({
      'products.product': { $in: productIds },
    })
      .populate('user', 'fullName emailAddress mobileNumber createdAt')
      .populate('products.product', 'productName condition category type rentalConfigurations createdVia salesConfiguration variants')
      .sort({ createdAt: -1 });

    const serviceBookings = await ServiceBooking.find({ vendor: vendorId })
      .populate('user', 'fullName emailAddress mobileNumber createdAt')
      .sort({ createdAt: -1 });

    const categories = await Category.find().select('name commissionRate').lean();
    const categoryRateMap = buildCategoryRateMap(categories);

    const byCustomer = new Map();

    orders.forEach((order) => {
      const orderUserId = String(order.user?._id || '');
      if (!orderUserId) return;

      // const userName = order.user?.fullName || 'Customer';
      // const userEmail = order.user?.emailAddress || '';
      // const orderDate = order.createdAt;
      // const rentalDuration = Number(order.rentalDuration || 0);

      // const items = (order.products || []).filter((it) =>
      //   productIds.includes(String(it.product?._id || it.product)),
      // );
      // if (!items.length) return;

      // if (!byCustomer.has(orderUserId)) {
      //   byCustomer.set(orderUserId, {
      //     _id: orderUserId,
      //     fullName: userName,
      //     emailAddress: userEmail,
      //     lastOrderAt: orderDate,
      //     service: 0,
      //     newBuy: 0,
      //     usedBuy: 0,
      //     rent: 0,
      //     deposit: 0,
      //     shipping: 0,
      //     lifetimeValue: 0,
      //     ordersCount: 0,
      //     totalTenureMonths: 0,
      //   });
      // }

      // const userName = order.user?.fullName || 'Customer';
      // const userEmail = order.user?.emailAddress || '';
      // const userMobile = order.user?.mobileNumber || '';
      // const orderDate = order.createdAt;
      // const rentalDuration = Number(order.rentalDuration || 0);

      // const items = (order.products || []).filter((it) =>
      //   productIds.includes(String(it.product?._id || it.product)),
      // );
      // if (!items.length) return;

      // if (!byCustomer.has(orderUserId)) {
      //   byCustomer.set(orderUserId, {
      //     _id: orderUserId,
      //     fullName: userName,
      //     emailAddress: userEmail,
      //     mobileNumber: userMobile,
      //     lastOrderAt: orderDate,
      //     service: 0,
      //     newBuy: 0,
      //     usedBuy: 0,
      //     rent: 0,
      //     deposit: 0,
      //     shipping: 0,
      //     lifetimeValue: 0,
      //     ordersCount: 0,
      //     totalTenureMonths: 0,
      //   });
      // }

      const userName = order.user?.fullName || 'Customer';
      const userEmail = order.user?.emailAddress || '';
      const userMobile = order.user?.mobileNumber || '';
      const userCreatedAt = order.user?.createdAt || null;
      const orderDate = order.createdAt;
      const rentalDuration = Number(order.rentalDuration || 0);

      const items = (order.products || []).filter((it) =>
        productIds.includes(String(it.product?._id || it.product)),
      );
      if (!items.length) return;

      if (!byCustomer.has(orderUserId)) {
        byCustomer.set(orderUserId, {
          _id: orderUserId,
          fullName: userName,
          emailAddress: userEmail,
          mobileNumber: userMobile,
          createdAt: userCreatedAt,
          lastOrderAt: orderDate,
          service: 0,
          newBuy: 0,
          usedBuy: 0,
          mintBuy: 0,
          rent: 0,
          deposit: 0,
          shipping: 0,
          lifetimeValue: 0,
          ordersCount: 0,
          totalTenureMonths: 0,
        });
      }

      const row = byCustomer.get(orderUserId);
      row.ordersCount += 1;
      row.totalTenureMonths += rentalDuration;
      if (new Date(orderDate) > new Date(row.lastOrderAt)) {
        row.lastOrderAt = orderDate;
      }

      items.forEach((it) => {
        const pid = String(it.product?._id || it.product);
        const p = productMap.get(pid);
        const lineForCalc = {
          pricePerDay: it.pricePerDay,
          originalPricePerDay: it.originalPricePerDay,
          offerSource: it.offerSource,
          quantity: it.quantity,
          refundableDeposit: it.refundableDeposit,
          rentalDuration: it.rentalDuration,
          tenureUnit: it.tenureUnit,
          productType: it.productType,
          variantId: it.variantId,
          variantName: it.variantName,
          product: p || it.product || { category: '' },
        };
        const money = computeVendorLineMoney(lineForCalc, categoryRateMap);
        const lineBase = money.netProduct;
        const lineDeposit = money.deposit;

        const category = String(p?.category || '').toLowerCase();
        const type = String(p?.type || '').toLowerCase();
        const condition = String(p?.condition || '').toLowerCase();

        if (category.includes('service')) {
          row.service += lineBase;
        } else if (type === 'sell') {
          if (condition.includes('new')) {
            row.newBuy += lineBase;
          } else if (condition.includes('mint')) {
            row.mintBuy += lineBase;
          } else {
            row.usedBuy += lineBase;
          }
        } else {
          row.rent += lineBase;
        }

        // row.deposit += Math.round(lineBase * 0.3);
        // row.shipping += Math.round(lineBase * 0.05);
        // row.lifetimeValue += lineBase;
        row.deposit += lineDeposit;
        row.shipping += Math.round(lineBase * 0.05);
        row.lifetimeValue += lineBase + lineDeposit;
      });
    });

    // const customers = Array.from(byCustomer.values())
    serviceBookings.forEach((booking) => {
      if (String(booking.status).toLowerCase() === 'cancelled') return;

      const bookingUserId = String(booking.user?._id || '');
      if (!bookingUserId) return;

      // const userName = booking.user?.fullName || 'Customer';
      // const userEmail = booking.user?.emailAddress || '';
      // const bookingDate = booking.createdAt;
      // const amount = Number(booking.totalAmount || 0);

      // if (!byCustomer.has(bookingUserId)) {
      //   byCustomer.set(bookingUserId, {
      //     _id: bookingUserId,
      //     fullName: userName,
      //     emailAddress: userEmail,
      //     lastOrderAt: bookingDate,
      //     service: 0,
      //     newBuy: 0,
      //     usedBuy: 0,
      //     rent: 0,
      //     deposit: 0,
      //     shipping: 0,
      //     lifetimeValue: 0,
      //     ordersCount: 0,
      //     totalTenureMonths: 0,
      //   });
      // }

      // const userName = booking.user?.fullName || 'Customer';
      // const userEmail = booking.user?.emailAddress || '';
      // const userMobile = booking.user?.mobileNumber || '';
      // const bookingDate = booking.createdAt;
      // const amount = Number(booking.totalAmount || 0);

      // if (!byCustomer.has(bookingUserId)) {
      //   byCustomer.set(bookingUserId, {
      //     _id: bookingUserId,
      //     fullName: userName,
      //     emailAddress: userEmail,
      //     mobileNumber: userMobile,
      //     lastOrderAt: bookingDate,
      //     service: 0,
      //     newBuy: 0,
      //     usedBuy: 0,
      //     rent: 0,
      //     deposit: 0,
      //     shipping: 0,
      //     lifetimeValue: 0,
      //     ordersCount: 0,
      //     totalTenureMonths: 0,
      //   });
      // }

      const userName = booking.user?.fullName || 'Customer';
      const userEmail = booking.user?.emailAddress || '';
      const userMobile = booking.user?.mobileNumber || '';
      const userCreatedAt = booking.user?.createdAt || null;
      const bookingDate = booking.createdAt;
      const amount = Number(booking.totalAmount || 0);

      if (!byCustomer.has(bookingUserId)) {
        byCustomer.set(bookingUserId, {
          _id: bookingUserId,
          fullName: userName,
          emailAddress: userEmail,
          mobileNumber: userMobile,
          createdAt: userCreatedAt,
          lastOrderAt: bookingDate,
          service: 0,
          newBuy: 0,
          usedBuy: 0,
          mintBuy: 0,
          rent: 0,
          deposit: 0,
          shipping: 0,
          lifetimeValue: 0,
          ordersCount: 0,
          totalTenureMonths: 0,
        });
      }

      const row = byCustomer.get(bookingUserId);
      row.service += amount;
      row.lifetimeValue += amount;
      if (new Date(bookingDate) > new Date(row.lastOrderAt)) {
        row.lastOrderAt = bookingDate;
      }
    });

    // const customers = Array.from(byCustomer.values())
    //   .map((c, idx) => ({
    //     ...c,
    //     customerCode: `CUST-${String(idx + 1).padStart(3, '0')}`,
    //     avgTenureMonths: c.ordersCount
    //       ? Number((c.totalTenureMonths / c.ordersCount).toFixed(1))
    //       : 0,
    //   }))
    //   .sort((a, b) => b.lifetimeValue - a.lifetimeValue);
    const customerUserIds = Array.from(byCustomer.keys())
      .filter((id) => mongoose.Types.ObjectId.isValid(String(id)))
      .map((id) => new mongoose.Types.ObjectId(String(id)));

    const userDocs = await User.find({ _id: { $in: customerUserIds } })
      .select('customerNumber')
      .lean();
    const customerNumberMap = new Map(
      userDocs.map((u) => [String(u._id), u.customerNumber]),
    );

    const customers = Array.from(byCustomer.values())
      .map((c) => {
        const customerNumber = customerNumberMap.get(String(c._id));
        const customerCode =
          customerNumber != null && customerNumber > 0
            ? `CUST-${String(customerNumber).padStart(3, '0')}`
            : `CUST-${String(c._id).slice(-6).toUpperCase()}`;
        return {
          ...c,
          customerCode,
          avgTenureMonths: c.ordersCount
            ? Number((c.totalTenureMonths / c.ordersCount).toFixed(1))
            : 0,
        };
      })
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue);

    await enrichCustomersWithKycPhones(customers);

    const totals = customers.reduce(
      (acc, c) => {
        acc.service += c.service;
        acc.newBuy += c.newBuy;
        acc.usedBuy += c.usedBuy;
        acc.mintBuy += c.mintBuy;
        acc.rent += c.rent;
        acc.deposit += c.deposit;
        acc.shipping += c.shipping;
        acc.lifetime += c.lifetimeValue;
        return acc;
      },
      {
        totalCustomers: customers.length,
        topCustomers: customers.filter((c) => Number(c.ordersCount || 0) >= 5)
          .length,
        revenue: 0,
        avgTenureMonths: 0,
        service: 0,
        newBuy: 0,
        usedBuy: 0,
        mintBuy: 0,
        rent: 0,
        deposit: 0,
        shipping: 0,
        lifetime: 0,
      },
    );

    totals.revenue = totals.lifetime;
    totals.avgTenureMonths = customers.length
      ? Number(
          (
            customers.reduce((s, c) => s + Number(c.avgTenureMonths || 0), 0) /
            customers.length
          ).toFixed(1),
        )
      : 0;

    return res.json({ customers, totals });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const populateVendorCustomerOrder = [
  { path: 'user', select: 'fullName emailAddress' },
  {
    path: 'products.product',
    select:
      'productName image category type rentalConfigurations refundableDeposit vendorId logisticsVerification createdVia salesConfiguration variants',
  },
];

export const getVendorCustomerDetails = async (req, res) => {
  try {
    const vendorId = req.vendor?._id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Vendor not authenticated' });
    }

    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ message: 'Invalid customer id.' });
    }

    const vendorProductIds = await Product.find({ vendorId }).distinct('_id');
    const productIds = (vendorProductIds || []).map((id) => String(id));
    if (!productIds.length) {
      return res
        .status(404)
        .json({ message: 'No products listed for your store yet.' });
    }

    // const user = await User.findById(userId)
    //   .select('fullName emailAddress createdAt customerNumber')
    //   .lean();
    const user = await User.findById(userId)
      .select('fullName emailAddress mobileNumber createdAt customerNumber')
      .lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const uid = new mongoose.Types.ObjectId(String(userId));

    const orderMatch = {
      user: uid,
      'products.product': { $in: productIds },
    };

    const [ordersRaw, kycLean, issueOrdersRaw, addressDoc, categories] =
      await Promise.all([
        Order.find(orderMatch)
          .populate(populateVendorCustomerOrder)
          .sort({ createdAt: -1 })
          .lean(),
        UserKyc.findOne({ userId: uid }).lean(),
        Order.find({
          ...orderMatch,
          'products.issueReports.0': { $exists: true },
        })
          .populate(populateVendorCustomerOrder)
          .sort({ createdAt: -1 })
          .lean(),
        Address.findOne({ user: uid }).sort({ createdAt: -1 }).lean(),
        Category.find().select('name commissionRate').lean(),
      ]);
    const categoryRateMap = buildCategoryRateMap(categories);

    const ordersFiltered = ordersRaw
      .map((o) => filterOrderToVendorProducts(o, productIds))
      .filter(Boolean);

    if (!ordersFiltered.length) {
      return res.status(404).json({
        message: 'This customer has no orders with your products.',
      });
    }

    const issueOrdersFiltered = issueOrdersRaw
      .map((o) => filterOrderToVendorProducts(o, productIds))
      .filter(Boolean);

    // const orderPhone = ordersFiltered.length
    //   ? String(ordersFiltered[0].phone || '').trim()
    //   : '';
    // const resolvedProfilePhone =
    //   String(kycLean?.contactNumber || '').trim() ||
    //   String(addressDoc?.phone || '').trim() ||
    //   orderPhone;

    const orderPhone = ordersFiltered.length
      ? String(ordersFiltered[0].phone || '').trim()
      : '';
    const resolvedProfilePhone =
      String(user.mobileNumber || '').trim() ||
      String(kycLean?.contactNumber || '').trim() ||
      String(addressDoc?.phone || '').trim() ||
      orderPhone;

    const activeRentals = buildMyRentalsStyleActiveRows(ordersFiltered, {
      vendorView: true,
      categoryRateMap,
    });
    const supportTickets =
      await buildIssueTicketsFromOrders(issueOrdersFiltered);

    const orderHistory = [];
    let totalAmount = 0;
    let totalRentAmount = 0;
    let totalDeposit = 0;
    let totalShipping = 0;

    ordersFiltered.forEach((order) => {
      const rentalDuration = Number(order.rentalDuration || 0);
      const vendorLines = order.products || [];

      const orderMoney = vendorLines.reduce(
        (acc, item) => {
          const money = computeVendorLineMoney(item, categoryRateMap);
          acc.net += money.netProduct;
          acc.deposit += money.deposit;
          acc.payout += money.payout;
          return acc;
        },
        { net: 0, deposit: 0, payout: 0 },
      );

      totalAmount += orderMoney.payout;
      totalRentAmount += orderMoney.net;
      totalDeposit += orderMoney.deposit;
      totalShipping += Math.round(orderMoney.net * 0.05);

      const firstLine = vendorLines[0];
      const firstProd = firstLine?.product;
      const isSell =
        String(firstLine?.productType || '').toLowerCase() === 'sell' ||
        (firstProd &&
          typeof firstProd === 'object' &&
          String(firstProd.type || '').toLowerCase() === 'sell');

      orderHistory.push({
        _id: order._id,
        date: order.createdAt,
        amount: orderMoney.payout,
        status: order.status,
        type: isSell ? 'Buy' : 'Rent',
        productType: String(
          firstLine?.productType || firstProd?.type || 'Rental',
        ),
        description:
          vendorLines
            .map((p) => p.product?.productName)
            .filter(Boolean)
            .join(', ') || 'Order',
      });
    });

    const tenureMonths = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) /
          (30 * 24 * 60 * 60 * 1000),
      ),
    );

    const customerNumber = user.customerNumber;
    const customerCode =
      customerNumber != null && customerNumber > 0
        ? `CUST-${String(customerNumber).padStart(3, '0')}`
        : `CUST-${String(user._id).slice(-6).toUpperCase()}`;

    const customerKyc = kycLean
      ? {
          status: kycLean.status,
          submittedAt: kycLean.submittedAt,
          reviewedAt: kycLean.reviewedAt,
          contactNumber: resolvedProfilePhone,
          aadhaarFront: kycLean.aadhaarFront || '',
          aadhaarBack: kycLean.aadhaarBack || '',
          panCard: kycLean.panCard || '',
          selfie: kycLean.selfie || '',
        }
      : null;

    return res.json({
      profilePhone: resolvedProfilePhone,
      // user: {
      //   _id: user._id,
      //   fullName: user.fullName,
      //   emailAddress: user.emailAddress,
      //   createdAt: user.createdAt,
      //   customerCode,
      //   customerNumber: customerNumber ?? null,
      // },
      user: {
        _id: user._id,
        fullName: user.fullName,
        emailAddress: user.emailAddress,
        mobileNumber: user.mobileNumber || '',
        createdAt: user.createdAt,
        customerCode,
        customerNumber: customerNumber ?? null,
      },
      summary: {
        tenureMonths,
        totalOrders: ordersFiltered.length,
        totalAmount,
        activeRentals: activeRentals.length,
      },
      financials: {
        rent: totalRentAmount,
        deposit: totalDeposit,
        shipping: totalShipping,
      },
      activeRentals,
      orderHistory,
      customerKyc,
      kycDocuments: [],
      supportTickets,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
