// import AdsPlan from '../../models/AdsPlan.js';

// export const createAdsPlan = async (req, res) => {
//   try {
//     const vendorId = req.vendor?._id || req.vendorId;
//     const {
//       planType,
//       products,
//       schedules,
//       subtotal,
//       discount,
//       total,
//       paymentMethod,
//     } = req.body;

//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({ message: 'No products selected' });
//     }
//     if (!paymentMethod) {
//       return res.status(400).json({ message: 'Payment method is required' });
//     }

//     const mappedProducts = products.map((p) => {
//       const schedule = schedules?.[p.id] || {};
//       // Parse startDate string (e.g. "2025-08-23") to start of that day UTC
//       const parsedStart = schedule.startDate
//         ? new Date(schedule.startDate + 'T00:00:00.000Z')
//         : new Date();
//       // Duration comes as "24 hrs" string from frontend — extract the number
//       const durationHours =
//         parseInt(
//           String(schedule.duration || '24').replace(/[^0-9]/g, ''),
//           10,
//         ) || 24;
//       return {
//         product: p.id,
//         productName: p.name,
//         category: p.category,
//         image: p.image,
//         startDate: parsedStart,
//         duration: durationHours,
//         price: p.boostPrice || 299,
//       };
//     });
//     const adsPlan = await AdsPlan.create({
//       vendor: vendorId,
//       planType: planType || 'category_hero',
//       products: mappedProducts,
//       subtotal,
//       discount,
//       total,
//       paymentMethod,
//       paymentStatus: 'paid',
//       status: 'scheduled',
//     });

//     return res.status(201).json({ adsPlan });
//   } catch (error) {
//     console.error('createAdsPlan error:', error);
//     return res.status(500).json({ message: 'Failed to create ads plan' });
//   }
// };

// export const getMyAdsPlans = async (req, res) => {
//   try {
//     const vendorId = req.vendor?._id || req.vendorId;
//     const adsPlans = await AdsPlan.find({ vendor: vendorId }).sort({
//       createdAt: -1,
//     });
//     return res.status(200).json({ adsPlans });
//   } catch (error) {
//     console.error('getMyAdsPlans error:', error);
//     return res.status(500).json({ message: 'Failed to fetch ads plans' });
//   }
// };

// export const getAllAdsPlans = async (req, res) => {
//   try {
//     const adsPlans = await AdsPlan.find({})
//       .populate('vendor', 'fullName businessName emailAddress')
//       .sort({ createdAt: -1 });
//     return res.status(200).json({ adsPlans });
//   } catch (error) {
//     console.error('getAllAdsPlans error:', error);
//     return res.status(500).json({ message: 'Failed to fetch ads plans' });
//   }
// };

// export const getActiveBoosts = async (req, res) => {
//   try {
//     const now = new Date();

//     // Find all scheduled/active plans
//     const plans = await AdsPlan.find({
//       status: { $in: ['scheduled', 'active'] },
//     }).lean();

//     const boostedProductIds = [];

//     plans.forEach((plan) => {
//       plan.products.forEach((p) => {
//         if (!p.startDate) return;
//         const start = new Date(p.startDate);
//         const durationHours = Number(plan.products[0]?.duration ?? 24);
//         // Use plan-level duration (all products in a plan share same duration)
//         const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

//         if (now >= start && now <= end) {
//           boostedProductIds.push(String(p.product));
//         }
//       });
//     });

//     // Deduplicate
//     const unique = [...new Set(boostedProductIds)];
//     return res.status(200).json({ boostedProductIds: unique });
//   } catch (error) {
//     console.error('getActiveBoosts error:', error);
//     return res.status(500).json({ message: 'Failed to fetch active boosts' });
//   }
// };

import AdsPlan from '../../models/AdsPlan.js';
import { getCityProductIds } from '../../utils/cityScope.js';
import Product from '../../models/Product.js';

export const createAdsPlan = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendorId;
    const {
      planType,
      products,
      schedules,
      subtotal,
      discount,
      total,
      paymentMethod,
    } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products selected' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const mappedProducts = products.map((p) => {
      const schedule = schedules?.[p.id] || {};
      // Parse startDate string (e.g. "2025-08-23") to start of that day UTC
      const parsedStart = schedule.startDate
        ? new Date(schedule.startDate + 'T00:00:00.000Z')
        : new Date();
      // Duration comes as "24 hrs" string from frontend — extract the number
      const durationHours =
        parseInt(
          String(schedule.duration || '24').replace(/[^0-9]/g, ''),
          10,
        ) || 24;
      return {
        product: p.id,
        productName: p.name,
        category: p.category,
        image: p.image,
        startDate: parsedStart,
        duration: durationHours,
        price: p.boostPrice || 299,
      };
    });
    const adsPlan = await AdsPlan.create({
      vendor: vendorId,
      planType: planType || 'category_hero',
      products: mappedProducts,
      subtotal,
      discount,
      total,
      paymentMethod,
      paymentStatus: 'paid',
      status: 'scheduled',
    });

    return res.status(201).json({ adsPlan });
  } catch (error) {
    console.error('createAdsPlan error:', error);
    return res.status(500).json({ message: 'Failed to create ads plan' });
  }
};

export const getMyAdsPlans = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendorId;
    const adsPlans = await AdsPlan.find({ vendor: vendorId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ adsPlans });
  } catch (error) {
    console.error('getMyAdsPlans error:', error);
    return res.status(500).json({ message: 'Failed to fetch ads plans' });
  }
};

export const getAllAdsPlans = async (req, res) => {
  try {
    const cityProductIds = await getCityProductIds(req);
    let adsPlanFilter = {};
    if (cityProductIds) {
      const cityProducts = await Product.find(
        { _id: { $in: cityProductIds } },
        { vendorId: 1 },
      ).lean();
      const cityVendorIds = [
        ...new Set(cityProducts.map((p) => String(p.vendorId))),
      ];
      adsPlanFilter = { vendor: { $in: cityVendorIds } };
    }

    const adsPlans = await AdsPlan.find(adsPlanFilter)
      .populate('vendor', 'fullName businessName emailAddress')
      .sort({ createdAt: -1 });
    return res.status(200).json({ adsPlans });
  } catch (error) {
    console.error('getAllAdsPlans error:', error);
    return res.status(500).json({ message: 'Failed to fetch ads plans' });
  }
};

export const getActiveBoosts = async (req, res) => {
  try {
    const now = new Date();

    // Find all scheduled/active plans
    const plans = await AdsPlan.find({
      status: { $in: ['scheduled', 'active'] },
    }).lean();

    const boostedProductIds = [];

    plans.forEach((plan) => {
      plan.products.forEach((p) => {
        if (!p.startDate) return;
        const start = new Date(p.startDate);
        const durationHours = Number(plan.products[0]?.duration ?? 24);
        // Use plan-level duration (all products in a plan share same duration)
        const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

        if (now >= start && now <= end) {
          boostedProductIds.push(String(p.product));
        }
      });
    });

    // Deduplicate
    const unique = [...new Set(boostedProductIds)];
    return res.status(200).json({ boostedProductIds: unique });
  } catch (error) {
    console.error('getActiveBoosts error:', error);
    return res.status(500).json({ message: 'Failed to fetch active boosts' });
  }
};
