import Product from '../../models/Product.js';
import ServiceProduct from '../../models/ServiceProduct.js';
import { getCityProductIds } from '../../utils/cityScope.js';

/**
 * Resolve model dynamically
 */
const getModel = (listingType) => {
  if (listingType === 'product') {
    return Product;
  }

  if (listingType === 'service') {
    return ServiceProduct;
  }

  return null;
};

/**
 * Add listing to featured
 */
export const addToFeatured = async (req, res) => {
  try {
    const { listingId, listingType, tab } = req.body; // ✅ tab bhi lo body se

    if (!listingId || !listingType || !tab) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID, listing type and tab are required',
      });
    }

    const Model = getModel(listingType);
    if (!Model)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid listing type' });

    const listing = await Model.findById(listingId);
    if (!listing)
      return res
        .status(404)
        .json({ success: false, message: 'Listing not found' });

    // ── Tab-specific filter for priority calculation ────────────────────────
    const tabFilter = { 'featured.enabled': true };

    if (tab === 'monthly_rental') tabFilter.type = 'Rental';
    else if (tab === 'buying') tabFilter.type = 'Sell';
    // service_package — ServiceProduct collection hi alag hai, koi extra filter nahi

    const lastItem = await Model.findOne(tabFilter)
      .sort({ 'featured.priorityRank': -1 })
      .select('featured.priorityRank')
      .lean();

    const nextRank = (lastItem?.featured?.priorityRank ?? 0) + 1;
    // ──────────────────────────────────────────────────────────────────────

    listing.featured = {
      enabled: true,
      priorityRank: nextRank,
      status: 'live',
      featuredAt: new Date(),
      featuredBy: req.admin._id,
    };

    await listing.save();

    return res.status(200).json({
      success: true,
      message: 'Added to featured successfully',
      data: listing,
    });
  } catch (error) {
    console.error('addToFeatured error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Remove from featured
 */
export const removeFromFeatured = async (req, res) => {
  try {
    const { listingId, listingType } = req.params;

    const Model = getModel(listingType);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing type',
      });
    }

    const listing = await Model.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    listing.featured = {
      enabled: false,
      priorityRank: 0,
      status: 'inactive',
      featuredAt: null,
      featuredBy: null,
    };

    await listing.save();

    return res.status(200).json({
      success: true,
      message: 'Removed from featured successfully',
    });
  } catch (error) {
    console.error('removeFromFeatured error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Toggle featured status
 */
export const toggleFeaturedStatus = async (req, res) => {
  try {
    const { listingId, listingType } = req.params;

    const Model = getModel(listingType);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing type',
      });
    }

    const listing = await Model.findById(listingId);

    if (!listing || !listing.featured?.enabled) {
      return res.status(404).json({
        success: false,
        message: 'Featured listing not found',
      });
    }

    listing.featured.status =
      listing.featured.status === 'live' ? 'inactive' : 'live';

    await listing.save();

    return res.status(200).json({
      success: true,
      message: 'Featured status updated successfully',
      data: listing,
    });
  } catch (error) {
    console.error('toggleFeaturedStatus error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Update featured priority
 */
export const updateFeaturedPriority = async (req, res) => {
  try {
    const { listingId, listingType } = req.params;
    const { priorityRank } = req.body;

    const Model = getModel(listingType);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing type',
      });
    }

    const listing = await Model.findById(listingId);

    if (!listing || !listing.featured?.enabled) {
      return res.status(404).json({
        success: false,
        message: 'Featured listing not found',
      });
    }

    listing.featured.priorityRank = priorityRank;

    await listing.save();

    return res.status(200).json({
      success: true,
      message: 'Priority updated successfully',
      data: listing,
    });
  } catch (error) {
    console.error('updateFeaturedPriority error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get featured listings
 */
// export const getFeaturedListings = async (req, res) => {
//   try {
//     const { tab, search = '' } = req.query;

//     let Model = null;

//     let filter = {
//       'featured.enabled': true,
//     };

//     /**
//      * Monthly Rentals
//      */
//     if (tab === 'monthly_rental') {
//       Model = Product;

//       filter.type = 'Rental';
//     } else if (tab === 'buying') {
//       /**
//        * Buying Products
//        */
//       Model = Product;

//       filter.type = 'Sell';
//     } else if (tab === 'service_package') {
//       /**
//        * Service Packages
//        */
//       Model = ServiceProduct;
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid tab type',
//       });
//     }

//     /**
//      * Search support
//      */
//     if (search) {
//       filter.productName = {
//         $regex: search,
//         $options: 'i',
//       };
//     }

//     const listings = await Model.aggregate([
//       /**
//        * Match filter
//        */
//       {
//         $match: filter,
//       },

//       /**
//        * Vendor Lookup
//        */
//       {
//         $lookup: {
//           from: 'vendors',
//           localField: 'vendorId',
//           foreignField: '_id',
//           as: 'vendor',
//         },
//       },

//       /**
//        * Convert vendor array -> object
//        */
//       {
//         $unwind: {
//           path: '$vendor',
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       /**
//        * Final response shape
//        */
//       // {
//       //   $project: {
//       //     _id: 1,
//       //     productName: 1,
//       //     image: 1,
//       //     images: 1,
//       //     price: 1,
//       //     type: 1,
//       //     category: 1,
//       //     subCategory: 1,
//       //     stock: 1,
//       //     status: 1,
//       //     featured: 1,
//       //     createdAt: 1,

//       //     vendor: {
//       //       _id: '$vendor._id',
//       //       name: '$vendor.fullName',
//       //     },
//       //   },
//       // },
//       {
//         $project: {
//           _id: 1,
//           productName: 1,
//           image: 1,
//           images: 1,
//           price: 1,
//           type: 1,
//           category: 1,
//           subCategory: 1,
//           stock: 1,
//           status: 1,
//           featured: 1,
//           createdAt: 1,
//           rentalConfigurations: 1,
//           variants: 1,

//           vendor: {
//             _id: '$vendor._id',
//             name: '$vendor.fullName',
//           },
//         },
//       },

//       /**
//        * Sorting
//        */
//       {
//         $sort: {
//           'featured.priorityRank': 1,
//           createdAt: -1,
//         },
//       },
//     ]);

//     return res.status(200).json({
//       success: true,
//       count: listings.length,
//       data: listings,
//     });
//   } catch (error) {
//     console.error('getFeaturedListings error:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// };

export const getFeaturedListings = async (req, res) => {
  try {
    const { tab, search = '' } = req.query;
    const cityProductIds = await getCityProductIds(req);

    let Model = null;

    let filter = {
      'featured.enabled': true,
    };

    /**
     * Monthly Rentals
     */
    // if (tab === 'monthly_rental') {
    //   Model = Product;

    //   filter.type = 'Rental';
    // } else if (tab === 'buying') {
    //   /**
    //    * Buying Products
    //    */
    //   Model = Product;

    //   filter.type = 'Sell';
    // } else if (tab === 'service_package') {
    if (tab === 'monthly_rental') {
      Model = Product;

      filter.type = 'Rental';
      if (cityProductIds) {
        filter._id = { $in: cityProductIds };
      }
    } else if (tab === 'buying') {
      /**
       * Buying Products
       */
      Model = Product;

      filter.type = 'Sell';
      if (cityProductIds) {
        filter._id = { $in: cityProductIds };
      }
      // } else if (tab === 'service_package') {
      //   /**
      //    * Service Packages
      //    */
      //   Model = ServiceProduct;
      // } else {
    } else if (tab === 'service_package') {
      /**
       * Service Packages
       */
      Model = ServiceProduct;

      if (req.admin?.role === 'subadmin' && req.admin?.location) {
        const city = req.admin.location;
        const kycDocs = await VendorKyc.find(
          {},
          { 'storeManagement.stores': 1 },
        );
        const storeIds = [];
        kycDocs.forEach((doc) => {
          doc.storeManagement.stores.forEach((store) => {
            const effectiveCity =
              store.city || extractCityFromAddress(store.mapAddress);
            if (effectiveCity === city) storeIds.push(String(store._id));
          });
        });
        filter.storeId = { $in: storeIds };
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid tab type',
      });
    }

    /**
     * Search support
     */
    if (search) {
      filter.productName = {
        $regex: search,
        $options: 'i',
      };
    }

    const listings = await Model.aggregate([
      /**
       * Match filter
       */
      {
        $match: filter,
      },

      /**
       * Vendor Lookup
       */
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor',
        },
      },

      /**
       * Convert vendor array -> object
       */
      {
        $unwind: {
          path: '$vendor',
          preserveNullAndEmptyArrays: true,
        },
      },

      /**
       * Final response shape
       */
      // {
      //   $project: {
      //     _id: 1,
      //     productName: 1,
      //     image: 1,
      //     images: 1,
      //     price: 1,
      //     type: 1,
      //     category: 1,
      //     subCategory: 1,
      //     stock: 1,
      //     status: 1,
      //     featured: 1,
      //     createdAt: 1,

      //     vendor: {
      //       _id: '$vendor._id',
      //       name: '$vendor.fullName',
      //     },
      //   },
      // },
      {
        $project: {
          _id: 1,
          productName: 1,
          image: 1,
          images: 1,
          price: 1,
          type: 1,
          category: 1,
          subCategory: 1,
          stock: 1,
          status: 1,
          featured: 1,
          createdAt: 1,
          rentalConfigurations: 1,
          variants: 1,

          vendor: {
            _id: '$vendor._id',
            name: '$vendor.fullName',
          },
        },
      },

      /**
       * Sorting
       */
      {
        $sort: {
          'featured.priorityRank': 1,
          createdAt: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error('getFeaturedListings error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
/**
 * Get available listings for featuring
 * (Modal popup listing API)
 */
// export const getAvailableListings = async (req, res) => {
//   try {
//     const { tab, search = '' } = req.query;

//     let Model = null;

//     let filter = {
//       $or: [
//         { 'featured.enabled': false },
//         { featured: { $exists: false } },
//         { featured: null },
//         { 'featured.enabled': { $exists: false } },
//       ],
//     };

//     /**
//      * Monthly Rentals
//      */
//     if (tab === 'monthly_rental') {
//       Model = Product;

//       filter.type = 'Rental';
//     } else if (tab === 'buying') {
//       /**
//        * Buying
//        */
//       Model = Product;

//       filter.type = 'Sell';
//     } else if (tab === 'service_package') {
//       /**
//        * Services
//        */
//       Model = ServiceProduct;
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid tab type',
//       });
//     }

//     /**
//      * Search support
//      */
//     if (search) {
//       filter.productName = {
//         $regex: search,
//         $options: 'i',
//       };
//     }

//     const listings = await Model.aggregate([
//       {
//         $match: filter,
//       },

//       /**
//        * Vendor Lookup
//        */
//       {
//         $lookup: {
//           from: 'vendors',
//           localField: 'vendorId',
//           foreignField: '_id',
//           as: 'vendor',
//         },
//       },

//       /**
//        * Convert array -> object
//        */
//       {
//         $unwind: {
//           path: '$vendor',
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       /**
//        * Final response shape
//        */
//       // {
//       //   $project: {
//       //     productName: 1,
//       //     image: 1,
//       //     price: 1,
//       //     type: 1,
//       //     category: 1,
//       //     stock: 1,
//       //     featured: 1,
//       //     createdAt: 1,

//       //     vendor: {
//       //       _id: '$vendor._id',
//       //       name: '$vendor.fullName',
//       //     },
//       //   },
//       // },

//       {
//         $project: {
//           productName: 1,
//           image: 1,
//           price: 1,
//           type: 1,
//           category: 1,
//           stock: 1,
//           featured: 1,
//           createdAt: 1,
//           rentalConfigurations: 1,
//           variants: 1,

//           vendor: {
//             _id: '$vendor._id',
//             name: '$vendor.fullName',
//           },
//         },
//       },

//       /**
//        * Sorting
//        */
//       {
//         $sort: {
//           createdAt: -1,
//         },
//       },
//     ]);

//     return res.status(200).json({
//       success: true,
//       count: listings.length,
//       data: listings,
//     });
//   } catch (error) {
//     console.error('getAvailableListings error:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// };

export const getAvailableListings = async (req, res) => {
  try {
    const { tab, search = '' } = req.query;
    const cityProductIds = await getCityProductIds(req);

    let Model = null;

    let filter = {
      $or: [
        { 'featured.enabled': false },
        { featured: { $exists: false } },
        { featured: null },
        { 'featured.enabled': { $exists: false } },
      ],
    };

    /**
     * Monthly Rentals
     */
    if (tab === 'monthly_rental') {
      Model = Product;

      filter.type = 'Rental';
      if (cityProductIds) {
        filter._id = { $in: cityProductIds };
      }
    } else if (tab === 'buying') {
      /**
       * Buying
       */
      Model = Product;

      filter.type = 'Sell';
      if (cityProductIds) {
        filter._id = { $in: cityProductIds };
      }
    } else if (tab === 'service_package') {
      /**
       * Services
       */
      Model = ServiceProduct;

      if (req.admin?.role === 'subadmin' && req.admin?.location) {
        const city = req.admin.location;
        const kycDocs = await VendorKyc.find(
          {},
          { 'storeManagement.stores': 1 },
        );
        const storeIds = [];
        kycDocs.forEach((doc) => {
          doc.storeManagement.stores.forEach((store) => {
            const effectiveCity =
              store.city || extractCityFromAddress(store.mapAddress);
            if (effectiveCity === city) storeIds.push(String(store._id));
          });
        });
        filter.storeId = { $in: storeIds };
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid tab type',
      });
    }

    /**
     * Search support
     */
    if (search) {
      filter.productName = {
        $regex: search,
        $options: 'i',
      };
    }

    const listings = await Model.aggregate([
      {
        $match: filter,
      },

      /**
       * Vendor Lookup
       */
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor',
        },
      },

      /**
       * Convert array -> object
       */
      {
        $unwind: {
          path: '$vendor',
          preserveNullAndEmptyArrays: true,
        },
      },

      /**
       * Final response shape
       */
      // {
      //   $project: {
      //     productName: 1,
      //     image: 1,
      //     price: 1,
      //     type: 1,
      //     category: 1,
      //     stock: 1,
      //     featured: 1,
      //     createdAt: 1,

      //     vendor: {
      //       _id: '$vendor._id',
      //       name: '$vendor.fullName',
      //     },
      //   },
      // },

      {
        $project: {
          productName: 1,
          image: 1,
          price: 1,
          type: 1,
          category: 1,
          stock: 1,
          featured: 1,
          createdAt: 1,
          rentalConfigurations: 1,
          variants: 1,

          vendor: {
            _id: '$vendor._id',
            name: '$vendor.fullName',
          },
        },
      },

      /**
       * Sorting
       */
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error('getAvailableListings error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
