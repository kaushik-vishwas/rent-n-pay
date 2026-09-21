// import express from 'express';
// import mongoose from 'mongoose';
// import { userAuth, adminAuth } from '../middleware/auth.js';
// import Cart from '../models/Cart.js';

// const router = express.Router();

// const getUserId = (req) => req.user?._id || req.user?.id;

// /**
//  * USER: Sync (upsert) the entire current cart items array for this user.
//  * Called from frontend cartSlice whenever items change (add/remove/update/tenure/dates).
//  * Body: { items: [...] }  (same shape as cartSlice state.items)
//  */
// router.post('/sync', userAuth, async (req, res) => {
//   try {
//     const userId = getUserId(req);
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });

//     const items = Array.isArray(req.body?.items) ? req.body.items : [];

//     const cart = await Cart.findOneAndUpdate(
//       { userId },
//       { userId, items },
//       { upsert: true, new: true, setDefaultsOnInsert: true },
//     );

//     res.json({ success: true, cart });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: 'Failed to sync cart', error: err.message });
//   }
// });

// /**
//  * USER: Remove a single product from this user's server-side cart.
//  * Used as a lightweight alternative to full /sync for a single removal.
//  */
// router.delete('/item/:productId', userAuth, async (req, res) => {
//   try {
//     const userId = getUserId(req);
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });

//     const { productId } = req.params;

//     const cart = await Cart.findOneAndUpdate(
//       { userId },
//       { $pull: { items: { productId } } },
//       { new: true },
//     );

//     res.json({ success: true, cart: cart || { items: [] } });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: 'Failed to remove item', error: err.message });
//   }
// });

// /**
//  * ADMIN: Get all live carts across all users, flattened into rows
//  * (one row per cart item, with the owning user attached) so the
//  * admin table can show every product currently in every user's cart.
//  */
// router.get('/admin/live-carts', adminAuth, async (req, res) => {
//   try {
//     const carts = await Cart.find({ 'items.0': { $exists: true } })
//       .populate('userId', 'fullName phone emailAddress')
//       .lean();

//     const rows = [];
//     carts.forEach((cart) => {
//       const user = cart.userId || {};
//       (cart.items || []).forEach((item) => {
//         rows.push({
//           userId: user._id,
//           customerName: user.fullName || 'Customer',
//           customerPhone: user.phone || '',
//           customerEmail: user.emailAddress || '',
//           cartUpdatedAt: cart.updatedAt,
//           ...item,
//         });
//       });
//     });

//     res.json({ success: true, rows });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: 'Failed to fetch live carts', error: err.message });
//   }
// });

// export default router;

import express from 'express';
import mongoose from 'mongoose';
import { adminAuth } from '../middleware/auth.js';
import { userAuth } from '../middleware/userAuth.js';
import Cart from '../models/Cart.js';
import UserKyc from '../models/UserKyc.js';
import Product from '../models/Product.js';
import ServiceCart from '../models/ServiceCart.js';
import ServiceProduct from '../models/ServiceProduct.js';
import { getCityProductIds } from '../utils/cityScope.js';

const router = express.Router();

const getUserId = (req) => req.user?._id || req.user?.id;

/**
 * USER: Sync (upsert) the entire current cart items array for this user.
 * Called from frontend cartSlice whenever items change (add/remove/update/tenure/dates).
 * Body: { items: [...] }  (same shape as cartSlice state.items)
 */
router.post('/sync', userAuth, async (req, res) => {
  try {
    console.log(
      '[liveCart /sync] HIT. req.user:',
      req.user?._id,
      req.user?.emailAddress,
    );
    console.log('[liveCart /sync] body items received:', req.body?.items);

    const userId = getUserId(req);
    if (!userId) {
      console.log(
        '[liveCart /sync] NO userId found on req.user — returning 401',
      );
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { userId, items },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    console.log('[liveCart /sync] SAVED cart doc:', cart);

    res.json({ success: true, cart });
  } catch (err) {
    console.log('[liveCart /sync] ERROR:', err.message);
    res
      .status(500)
      .json({ message: 'Failed to sync cart', error: err.message });
  }
});

/**
 * USER: Remove a single product from this user's server-side cart.
 * Used as a lightweight alternative to full /sync for a single removal.
 */
router.delete('/item/:productId', userAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { productId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true },
    );

    res.json({ success: true, cart: cart || { items: [] } });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to remove item', error: err.message });
  }
});

/**
 * USER: Sync (upsert) the entire current pending service bookings array
 * for this user. Called from ServiceBookinModal.jsx after every booking
 * add, mirroring how the Redux cart middleware syncs product cart items.
 * Body: { bookings: [...] }  (same shape as rentpay_pending_service_bookings)
 */
router.post('/sync-services', userAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const bookings = Array.isArray(req.body?.bookings) ? req.body.bookings : [];

    const serviceCart = await ServiceCart.findOneAndUpdate(
      { userId },
      { userId, bookings },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json({ success: true, serviceCart });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to sync service cart', error: err.message });
  }
});

/**
 * ADMIN: Get all live carts across all users, flattened into rows
 * (one row per cart item, with the owning user attached) so the
 * admin table can show every product currently in every user's cart.
 */
// router.get('/admin/live-carts', adminAuth, async (req, res) => {
//   try {
//     console.log('[liveCart /admin/live-carts] HIT by admin:', req.admin?._id);

//     const allCartsRaw = await Cart.find({}).lean();
//     console.log(
//       '[liveCart /admin/live-carts] TOTAL cart docs in DB (any items):',
//       allCartsRaw.length,
//       allCartsRaw,
//     );

//     // const carts = await Cart.find({ 'items.0': { $exists: true } })
//     //   .populate('userId', 'fullName emailAddress')
//     //   .lean();
//     const carts = await Cart.find({ 'items.0': { $exists: true } })
//       .populate('userId', 'fullName emailAddress mobileNumber')
//       .lean();

//     console.log('[liveCart /admin/live-carts] carts WITH items:', carts.length);

//     const userIds = carts.map((c) => c.userId?._id).filter(Boolean);
//     const kycDocs = await UserKyc.find({ userId: { $in: userIds } })
//       .select('userId contactNumber')
//       .lean();
//     const phoneByUserId = {};
//     kycDocs.forEach((k) => {
//       phoneByUserId[String(k.userId)] = k.contactNumber || '';
//     });

//     console.log('[liveCart /admin/live-carts] KYC phone map:', phoneByUserId);

//     const allProductIds = [];
//     carts.forEach((cart) =>
//       (cart.items || []).forEach((item) => {
//         if (item.productId) allProductIds.push(item.productId);
//       }),
//     );
//     const products = await Product.find({ _id: { $in: allProductIds } })
//       .select('salesConfiguration price variants rentalConfigurations type')
//       .lean();
//     const productById = {};
//     products.forEach((p) => {
//       productById[String(p._id)] = p;
//     });

//     // Mirrors the storefront's sellBasePrice logic exactly (Trending.jsx):
//     // 1. salesConfiguration.salePrice, if set
//     // 2. numeric part of the product's own `price` field
//     // 3. first variant with a sellPrice
//     const getSellBasePrice = (p) => {
//       const configSale = Number(p?.salesConfiguration?.salePrice || 0);
//       if (configSale > 0) return configSale;

//       const numeric = Number(String(p?.price || '').replace(/[^\d.]/g, ''));
//       if (Number.isFinite(numeric) && numeric > 0) return numeric;

//       const variants = Array.isArray(p?.variants) ? p.variants : [];
//       const firstWithPrice = variants.find((v) => Number(v?.sellPrice) > 0);
//       return firstWithPrice ? Number(firstWithPrice.sellPrice) : 0;
//     };

//     // Rental original price = the product's tenure-tier `customerRent` for
//     // the SAME tenure the cart item was added with (before any offer
//     // discount was applied). Falls back to the cheapest available tier if
//     // an exact tenure match isn't found (e.g. tenure config changed since
//     // the item was added).
//     const getRentalBasePrice = (p, item) => {
//       const months = Number(item?.rentalMonths) || 1;
//       const unit = String(item?.tenureUnit || 'month');

//       const allConfigs = [
//         ...(Array.isArray(p?.rentalConfigurations)
//           ? p.rentalConfigurations
//           : []),
//         ...(Array.isArray(p?.variants)
//           ? p.variants.flatMap((v) =>
//               Array.isArray(v?.rentalConfigurations)
//                 ? v.rentalConfigurations
//                 : [],
//             )
//           : []),
//       ];

//       const matched = allConfigs.find((cfg) => {
//         const cfgUnit = cfg?.periodUnit === 'day' ? 'day' : 'month';
//         const cfgUnits =
//           cfgUnit === 'day' ? Number(cfg.days) || 1 : Number(cfg.months) || 1;
//         return cfgUnit === unit && cfgUnits === months;
//       });
//       if (matched)
//         return Number(matched.customerRent || matched.pricePerDay || 0);

//       const cheapest = allConfigs
//         .filter((cfg) => Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0)
//         .sort(
//           (a, b) =>
//             Number(a.customerRent || a.pricePerDay || 0) -
//             Number(b.customerRent || b.pricePerDay || 0),
//         )[0];
//       return cheapest
//         ? Number(cheapest.customerRent || cheapest.pricePerDay || 0)
//         : 0;
//     };

//     // console.log('[liveCart /admin/live-carts] products fetched:', products.length);

//     const rows = [];
//     carts.forEach((cart) => {
//       const user = cart.userId || {};
//       (cart.items || []).forEach((item) => {
//         const product = productById[String(item.productId)];
//         const isSellItem =
//           String(item?.productType || '').toLowerCase() === 'sell';
//         const originalPerUnit = isSellItem
//           ? getSellBasePrice(product)
//           : getRentalBasePrice(product, item);

//         // rows.push({
//         //   userId: user._id,
//         //   customerName: user.fullName || 'Customer',
//         //   customerPhone: phoneByUserId[String(user._id)] || '',
//         //   customerEmail: user.emailAddress || '',
//         //   cartUpdatedAt: cart.updatedAt,
//         //   mrpPricePerUnit: originalPerUnit,
//         //   ...item,
//         // });

//         rows.push({
//           userId: user._id,
//           customerName: user.fullName || 'Customer',
//           customerPhone:
//             user.mobileNumber || phoneByUserId[String(user._id)] || '',
//           customerEmail: user.emailAddress || '',
//           cartUpdatedAt: cart.updatedAt,
//           mrpPricePerUnit: originalPerUnit,
//           ...item,
//         });
//       });
//     });

//     // Merge in live SERVICE bookings the same way, so admin sees Rent +
//     // Buy + Service items in one unified table.
//     // const serviceCarts = await ServiceCart.find({
//     //   'bookings.0': { $exists: true },
//     // })
//     //   .populate('userId', 'fullName emailAddress')
//     //   .lean();
//     const serviceCarts = await ServiceCart.find({
//       'bookings.0': { $exists: true },
//     })
//       .populate('userId', 'fullName emailAddress mobileNumber')
//       .lean();

//     const serviceProductIds = [];
//     serviceCarts.forEach((sc) =>
//       (sc.bookings || []).forEach((b) => {
//         if (b.productId) serviceProductIds.push(b.productId);
//       }),
//     );
//     const serviceProducts = await ServiceProduct.find({
//       _id: { $in: serviceProductIds },
//     })
//       .select('refundableDeposit')
//       .lean();
//     const serviceProductById = {};
//     serviceProducts.forEach((sp) => {
//       serviceProductById[String(sp._id)] = sp;
//     });

//     serviceCarts.forEach((sc) => {
//       const user = sc.userId || {};
//       (sc.bookings || []).forEach((booking) => {
//         // rows.push({
//         //   userId: user._id,
//         //   customerName: user.fullName || 'Customer',
//         //   customerPhone: phoneByUserId[String(user._id)] || '',
//         //   customerEmail: user.emailAddress || '',
//         //   cartUpdatedAt: sc.updatedAt,
//         rows.push({
//           userId: user._id,
//           customerName: user.fullName || 'Customer',
//           customerPhone:
//             user.mobileNumber || phoneByUserId[String(user._id)] || '',
//           customerEmail: user.emailAddress || '',
//           cartUpdatedAt: sc.updatedAt,
//           mrpPricePerUnit: Number(
//             booking.originalAmount || booking.totalAmount || 0,
//           ),
//           productId: booking.productId,
//           title: booking.serviceName || 'Service',
//           image: booking.image || '',
//           pricePerDay: Number(booking.totalAmount || 0),
//           quantity: 1,
//           tenureUnit: 'month',
//           productType: 'Service',
//           refundableDeposit: 0,
//           bookingDate: booking.bookingDate || '',
//           timeSlotLabel: booking.timeSlot?.label || '',
//         });
//       });
//     });

//     console.log(
//       '[liveCart /admin/live-carts] FINAL rows sent to admin (incl. services):',
//       rows.length,
//       rows,
//     );

//     res.json({ success: true, rows });
//   } catch (err) {
//     console.log('[liveCart /admin/live-carts] ERROR:', err.message);
//     res
//       .status(500)
//       .json({ message: 'Failed to fetch live carts', error: err.message });
//   }
// });

router.get('/admin/live-carts', adminAuth, async (req, res) => {
  try {
    // console.log('[liveCart /admin/live-carts] HIT by admin:', req.admin?._id);

    // const allCartsRaw = await Cart.find({}).lean();
    console.log('[liveCart /admin/live-carts] HIT by admin:', req.admin?._id);

    const cityProductIds = await getCityProductIds(req);

    const allCartsRaw = await Cart.find({}).lean();
    console.log(
      '[liveCart /admin/live-carts] TOTAL cart docs in DB (any items):',
      allCartsRaw.length,
      allCartsRaw,
    );

    // const carts = await Cart.find({ 'items.0': { $exists: true } })
    //   .populate('userId', 'fullName emailAddress')
    //   .lean();
    const carts = await Cart.find({ 'items.0': { $exists: true } })
      .populate('userId', 'fullName emailAddress mobileNumber')
      .lean();

    console.log('[liveCart /admin/live-carts] carts WITH items:', carts.length);

    const userIds = carts.map((c) => c.userId?._id).filter(Boolean);
    const kycDocs = await UserKyc.find({ userId: { $in: userIds } })
      .select('userId contactNumber')
      .lean();
    const phoneByUserId = {};
    kycDocs.forEach((k) => {
      phoneByUserId[String(k.userId)] = k.contactNumber || '';
    });

    console.log('[liveCart /admin/live-carts] KYC phone map:', phoneByUserId);

    const allProductIds = [];
    carts.forEach((cart) =>
      (cart.items || []).forEach((item) => {
        if (item.productId) allProductIds.push(item.productId);
      }),
    );
    // const products = await Product.find({ _id: { $in: allProductIds } })
    //   .select('salesConfiguration price variants rentalConfigurations type')
    //   .lean();
    const scopedProductIds = cityProductIds
      ? allProductIds.filter((id) =>
          cityProductIds.some((cid) => String(cid) === String(id)),
        )
      : allProductIds;

    const products = await Product.find({ _id: { $in: scopedProductIds } })
      .select('salesConfiguration price variants rentalConfigurations type')
      .lean();
    const productById = {};
    products.forEach((p) => {
      productById[String(p._id)] = p;
    });

    // Mirrors the storefront's sellBasePrice logic exactly (Trending.jsx):
    // 1. salesConfiguration.salePrice, if set
    // 2. numeric part of the product's own `price` field
    // 3. first variant with a sellPrice
    const getSellBasePrice = (p) => {
      const configSale = Number(p?.salesConfiguration?.salePrice || 0);
      if (configSale > 0) return configSale;

      const numeric = Number(String(p?.price || '').replace(/[^\d.]/g, ''));
      if (Number.isFinite(numeric) && numeric > 0) return numeric;

      const variants = Array.isArray(p?.variants) ? p.variants : [];
      const firstWithPrice = variants.find((v) => Number(v?.sellPrice) > 0);
      return firstWithPrice ? Number(firstWithPrice.sellPrice) : 0;
    };

    // Rental original price = the product's tenure-tier `customerRent` for
    // the SAME tenure the cart item was added with (before any offer
    // discount was applied). Falls back to the cheapest available tier if
    // an exact tenure match isn't found (e.g. tenure config changed since
    // the item was added).
    const getRentalBasePrice = (p, item) => {
      const months = Number(item?.rentalMonths) || 1;
      const unit = String(item?.tenureUnit || 'month');

      const allConfigs = [
        ...(Array.isArray(p?.rentalConfigurations)
          ? p.rentalConfigurations
          : []),
        ...(Array.isArray(p?.variants)
          ? p.variants.flatMap((v) =>
              Array.isArray(v?.rentalConfigurations)
                ? v.rentalConfigurations
                : [],
            )
          : []),
      ];

      const matched = allConfigs.find((cfg) => {
        const cfgUnit = cfg?.periodUnit === 'day' ? 'day' : 'month';
        const cfgUnits =
          cfgUnit === 'day' ? Number(cfg.days) || 1 : Number(cfg.months) || 1;
        return cfgUnit === unit && cfgUnits === months;
      });
      if (matched)
        return Number(matched.customerRent || matched.pricePerDay || 0);

      const cheapest = allConfigs
        .filter((cfg) => Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0)
        .sort(
          (a, b) =>
            Number(a.customerRent || a.pricePerDay || 0) -
            Number(b.customerRent || b.pricePerDay || 0),
        )[0];
      return cheapest
        ? Number(cheapest.customerRent || cheapest.pricePerDay || 0)
        : 0;
    };

    // console.log('[liveCart /admin/live-carts] products fetched:', products.length);

    const rows = [];
    carts.forEach((cart) => {
      const user = cart.userId || {};
      // (cart.items || []).forEach((item) => {
      //   const product = productById[String(item.productId)];
      //   const isSellItem =
      //     String(item?.productType || '').toLowerCase() === 'sell';
      (cart.items || []).forEach((item) => {
        if (
          cityProductIds &&
          !cityProductIds.some((cid) => String(cid) === String(item.productId))
        ) {
          return;
        }

        const product = productById[String(item.productId)];
        const isSellItem =
          String(item?.productType || '').toLowerCase() === 'sell';
        const originalPerUnit = isSellItem
          ? getSellBasePrice(product)
          : getRentalBasePrice(product, item);

        // rows.push({
        //   userId: user._id,
        //   customerName: user.fullName || 'Customer',
        //   customerPhone: phoneByUserId[String(user._id)] || '',
        //   customerEmail: user.emailAddress || '',
        //   cartUpdatedAt: cart.updatedAt,
        //   mrpPricePerUnit: originalPerUnit,
        //   ...item,
        // });

        rows.push({
          userId: user._id,
          customerName: user.fullName || 'Customer',
          customerPhone:
            user.mobileNumber || phoneByUserId[String(user._id)] || '',
          customerEmail: user.emailAddress || '',
          cartUpdatedAt: cart.updatedAt,
          mrpPricePerUnit: originalPerUnit,
          ...item,
        });
      });
    });

    // Merge in live SERVICE bookings the same way, so admin sees Rent +
    // Buy + Service items in one unified table.
    // const serviceCarts = await ServiceCart.find({
    //   'bookings.0': { $exists: true },
    // })
    //   .populate('userId', 'fullName emailAddress')
    //   .lean();
    const serviceCarts = await ServiceCart.find({
      'bookings.0': { $exists: true },
    })
      .populate('userId', 'fullName emailAddress mobileNumber')
      .lean();

    const serviceProductIds = [];
    serviceCarts.forEach((sc) =>
      (sc.bookings || []).forEach((b) => {
        if (b.productId) serviceProductIds.push(b.productId);
      }),
    );
    const serviceProducts = await ServiceProduct.find({
      _id: { $in: serviceProductIds },
    })
      .select('refundableDeposit')
      .lean();
    const serviceProductById = {};
    serviceProducts.forEach((sp) => {
      serviceProductById[String(sp._id)] = sp;
    });

    serviceCarts.forEach((sc) => {
      const user = sc.userId || {};
      (sc.bookings || []).forEach((booking) => {
        // rows.push({
        //   userId: user._id,
        //   customerName: user.fullName || 'Customer',
        //   customerPhone: phoneByUserId[String(user._id)] || '',
        //   customerEmail: user.emailAddress || '',
        //   cartUpdatedAt: sc.updatedAt,
        rows.push({
          userId: user._id,
          customerName: user.fullName || 'Customer',
          customerPhone:
            user.mobileNumber || phoneByUserId[String(user._id)] || '',
          customerEmail: user.emailAddress || '',
          cartUpdatedAt: sc.updatedAt,
          mrpPricePerUnit: Number(
            booking.originalAmount || booking.totalAmount || 0,
          ),
          productId: booking.productId,
          title: booking.serviceName || 'Service',
          image: booking.image || '',
          pricePerDay: Number(booking.totalAmount || 0),
          quantity: 1,
          tenureUnit: 'month',
          productType: 'Service',
          refundableDeposit: 0,
          bookingDate: booking.bookingDate || '',
          timeSlotLabel: booking.timeSlot?.label || '',
        });
      });
    });

    console.log(
      '[liveCart /admin/live-carts] FINAL rows sent to admin (incl. services):',
      rows.length,
      rows,
    );

    res.json({ success: true, rows });
  } catch (err) {
    console.log('[liveCart /admin/live-carts] ERROR:', err.message);
    res
      .status(500)
      .json({ message: 'Failed to fetch live carts', error: err.message });
  }
});

export default router;
