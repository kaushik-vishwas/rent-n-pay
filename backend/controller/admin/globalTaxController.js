// import GlobalTaxConfig from '../../models/GlobalTaxConfig.js';
// import Category from '../../models/Category.js';
// import SubCategory from '../../models/SubCategory.js';

// const TYPE_FIELD_MAP = {
//   rental: 'availableInRent',
//   buying_new: 'availableInBuy',
//   buying_refurbished: 'availableInBuy',
//   services: 'availableInServices',
// };

// export const getGlobalTax = async (req, res) => {
//   try {
//     const doc = await GlobalTaxConfig.findOne().lean();

//     if (!doc) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           config: {
//             rental: { gst: 0, careTax: 0, lastUpdated: null },
//             buying_new: { gst: 0, careTax: 0, lastUpdated: null },
//             buying_refurbished: { gst: 0, careTax: 0, lastUpdated: null },
//             services: { gst: 0, careTax: 0, lastUpdated: null },
//           },
//         },
//       });
//     }

//     return res
//       .status(200)
//       .json({ success: true, data: { config: doc.config } });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const updateGlobalTax = async (req, res) => {
//   try {
//     const { config } = req.body;

//     if (!config || typeof config !== 'object') {
//       return res
//         .status(400)
//         .json({ success: false, message: 'config object is required' });
//     }

//     const now = new Date();

//     const stamped = {};
//     for (const [key, val] of Object.entries(config)) {
//       if (!TYPE_FIELD_MAP[key]) continue;
//       stamped[key] = {
//         gst: Math.max(0, Number(val.gst) || 0),
//         careTax: Math.max(0, Number(val.careTax) || 0),
//         lastUpdated: now,
//       };
//     }

//     // const updated = await GlobalTaxConfig.findOneAndUpdate(
//     //   {},
//     //   { $set: { config: stamped } },
//     //   { upsert: true, new: true },
//     // );

//     // Build partial $set — only touch the keys that were sent
//     const setFields = {};
//     for (const [key, vals] of Object.entries(stamped)) {
//       setFields[`config.${key}.gst`] = vals.gst;
//       setFields[`config.${key}.careTax`] = vals.careTax;
//       setFields[`config.${key}.lastUpdated`] = vals.lastUpdated;
//     }

//     // Upsert the single global config document (atomic per-key update)
//     const updated = await GlobalTaxConfig.findOneAndUpdate(
//       {},
//       { $set: setFields },
//       { upsert: true, new: true },
//     );

//     let categoriesUpdated = 0;
//     let subCategoriesUpdated = 0;

//     for (const [typeKey, vals] of Object.entries(stamped)) {
//       const platformField = TYPE_FIELD_MAP[typeKey];

//       const catResult = await Category.updateMany(
//         { [platformField]: true },
//         { $set: { defaultGst: vals.gst, defaultCareTax: vals.careTax } },
//       );
//       categoriesUpdated += catResult.modifiedCount || 0;

//       const parentIds = await Category.find({ [platformField]: true }).distinct(
//         '_id',
//       );
//       if (parentIds.length) {
//         const subResult = await SubCategory.updateMany(
//           { category: { $in: parentIds } },
//           { $set: { defaultGst: vals.gst, defaultCareTax: vals.careTax } },
//         );
//         subCategoriesUpdated += subResult.modifiedCount || 0;
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Global tax configuration updated',
//       data: {
//         config: updated.config,
//         categoriesUpdated,
//         subCategoriesUpdated,
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

import GlobalTaxConfig from '../../models/GlobalTaxConfig.js';
import Category from '../../models/Category.js';
import SubCategory from '../../models/SubCategory.js';

// const TYPE_FIELD_MAP = {
//   rental: 'availableInRent',
//   buying_new: 'availableInBuy',
//   buying_refurbished: 'availableInBuy',
//   services: 'availableInServices',
// };

const TYPE_FIELD_MAP = {
  rental: 'availableInRent',
  buying_new: 'availableInBuy',
  buying_refurbished: 'availableInBuy',
  buying_mint: 'availableInBuy',
  services: 'availableInServices',
};

export const getGlobalTax = async (req, res) => {
  try {
    const doc = await GlobalTaxConfig.findOne().lean();

    if (!doc) {
      return res.status(200).json({
        success: true,
        data: {
          config: {
            rental: {
              gst: 0,
              careTax: 0,
              repairWarranty: 0,
              relocationWarranty: 0,
              deliveryPackaging: 0,
              installationFee: 0,
              platformFee: 0,
              lastUpdated: null,
            },
            buying_new: {
              gst: 0,
              careTax: 0,
              repairWarranty: 0,
              relocationWarranty: 0,
              deliveryPackaging: 0,
              installationFee: 0,
              platformFee: 0,
              lastUpdated: null,
            },
            // buying_refurbished: {
            //   gst: 0,
            //   careTax: 0,
            //   repairWarranty: 0,
            //   relocationWarranty: 0,
            //   deliveryPackaging: 0,
            //   installationFee: 0,
            //   platformFee: 0,
            //   lastUpdated: null,
            // },
            // services: {
            buying_refurbished: {
              gst: 0,
              careTax: 0,
              repairWarranty: 0,
              relocationWarranty: 0,
              deliveryPackaging: 0,
              installationFee: 0,
              platformFee: 0,
              lastUpdated: null,
            },
            buying_mint: {
              gst: 0,
              careTax: 0,
              repairWarranty: 0,
              relocationWarranty: 0,
              deliveryPackaging: 0,
              installationFee: 0,
              platformFee: 0,
              lastUpdated: null,
            },
            services: {
              gst: 0,
              careTax: 0,
              repairWarranty: 0,
              relocationWarranty: 0,
              deliveryPackaging: 0,
              installationFee: 0,
              platformFee: 0,
              lastUpdated: null,
            },
          },
        },
      });
    }

    return res
      .status(200)
      .json({ success: true, data: { config: doc.config } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, taxBlocked } = req.body;
    const Model = type === 'subcategory' ? SubCategory : Category;
    const doc = await Model.findByIdAndUpdate(
      id,
      { $set: { taxBlocked: Boolean(taxBlocked) } },
      { new: true },
    );
    if (!doc)
      return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// export const updateCategoryTax = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { type } = req.query; // 'category' or 'subcategory'
//     const fields = [
//       'defaultGst',
//       'defaultCareTax',
//       'defaultRepairWarranty',
//       'defaultRelocationWarranty',
//       'defaultDeliveryPackaging',
//       'defaultInstallationFee',
//       'defaultPlatformFee',
//     ];
//     const $set = {};
//     fields.forEach((f) => {
//       if (req.body[f] !== undefined)
//         $set[f] = Math.max(0, Number(req.body[f]) || 0);
//     });
//     if (!Object.keys($set).length) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'No fields to update' });
//     }
//     const Model = type === 'subcategory' ? SubCategory : Category;
//     const doc = await Model.findByIdAndUpdate(id, { $set }, { new: true });
//     if (!doc)
//       return res.status(404).json({ success: false, message: 'Not found' });
//     return res.json({ success: true, data: doc });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

export const updateCategoryTax = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    const fields = [
      'defaultGst',
      'defaultCareTax',
      'defaultRepairWarranty',
      'defaultRelocationWarranty',
      'defaultDeliveryPackaging',
      'defaultInstallationFee',
      'defaultPlatformFee',
    ];
    const $set = {};
    fields.forEach((f) => {
      if (req.body[f] !== undefined)
        $set[f] = Math.max(0, Number(req.body[f]) || 0);
    });
    if (!Object.keys($set).length) {
      return res
        .status(400)
        .json({ success: false, message: 'No fields to update' });
    }

    if (type === 'subcategory') {
      const doc = await SubCategory.findByIdAndUpdate(
        id,
        { $set },
        { new: true },
      );
      if (!doc)
        return res.status(404).json({ success: false, message: 'Not found' });
      return res.json({ success: true, data: doc });
    } else {
      // Update the category itself
      const doc = await Category.findByIdAndUpdate(id, { $set }, { new: true });
      if (!doc)
        return res.status(404).json({ success: false, message: 'Not found' });
      // Cascade to all subcategories under this category
      await SubCategory.updateMany({ category: id }, { $set });
      return res.json({ success: true, data: doc, cascaded: true });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const updateGlobalTax = async (req, res) => {
  try {
    const { config } = req.body;

    if (!config || typeof config !== 'object') {
      return res
        .status(400)
        .json({ success: false, message: 'config object is required' });
    }

    const now = new Date();

    const stamped = {};
    for (const [key, val] of Object.entries(config)) {
      if (!TYPE_FIELD_MAP[key]) continue;
      stamped[key] = {
        gst: Math.max(0, Number(val.gst) || 0),
        careTax: Math.max(0, Number(val.careTax) || 0),
        repairWarranty: Math.max(0, Number(val.repairWarranty) || 0),
        relocationWarranty: Math.max(0, Number(val.relocationWarranty) || 0),
        deliveryPackaging: Math.max(0, Number(val.deliveryPackaging) || 0),
        installationFee: Math.max(0, Number(val.installationFee) || 0),
        platformFee: Math.max(0, Number(val.platformFee) || 0),
        lastUpdated: now,
      };
    }

    // const updated = await GlobalTaxConfig.findOneAndUpdate(
    //   {},
    //   { $set: { config: stamped } },
    //   { upsert: true, new: true },
    // );

    // Build partial $set — only touch the keys that were sent
    const setFields = {};
    for (const [key, vals] of Object.entries(stamped)) {
      setFields[`config.${key}.gst`] = vals.gst;
      setFields[`config.${key}.careTax`] = vals.careTax;
      setFields[`config.${key}.repairWarranty`] = vals.repairWarranty;
      setFields[`config.${key}.relocationWarranty`] = vals.relocationWarranty;
      setFields[`config.${key}.deliveryPackaging`] = vals.deliveryPackaging;
      setFields[`config.${key}.installationFee`] = vals.installationFee;
      setFields[`config.${key}.platformFee`] = vals.platformFee;
      setFields[`config.${key}.lastUpdated`] = vals.lastUpdated;
    }

    // Upsert the single global config document (atomic per-key update)
    const updated = await GlobalTaxConfig.findOneAndUpdate(
      {},
      { $set: setFields },
      { upsert: true, new: true },
    );

    let categoriesUpdated = 0;
    let subCategoriesUpdated = 0;

    for (const [typeKey, vals] of Object.entries(stamped)) {
      const platformField = TYPE_FIELD_MAP[typeKey];
      const taxSpread = {
        defaultGst: vals.gst,
        defaultCareTax: vals.careTax,
        defaultRepairWarranty: vals.repairWarranty,
        defaultRelocationWarranty: vals.relocationWarranty,
        defaultDeliveryPackaging: vals.deliveryPackaging,
        defaultInstallationFee: vals.installationFee,
        defaultPlatformFee: vals.platformFee,
      };

      const catResult = await Category.updateMany(
        { [platformField]: true },
        { $set: taxSpread },
      );
      categoriesUpdated += catResult.modifiedCount || 0;

      const parentIds = await Category.find({ [platformField]: true }).distinct(
        '_id',
      );
      if (parentIds.length) {
        const subResult = await SubCategory.updateMany(
          { category: { $in: parentIds } },
          { $set: taxSpread },
        );
        subCategoriesUpdated += subResult.modifiedCount || 0;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Global tax configuration updated',
      data: {
        config: updated.config,
        categoriesUpdated,
        subCategoriesUpdated,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
