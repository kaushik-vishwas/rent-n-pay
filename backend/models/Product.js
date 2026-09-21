// import mongoose from 'mongoose';

// const vendorRentalTierSchema = new mongoose.Schema(
//   {
//     months: { type: Number, default: 1 },
//     days: { type: Number, default: 0 },
//     periodUnit: {
//       type: String,
//       enum: ['month', 'day'],
//       default: 'month',
//     },
//     label: { type: String, default: '' },
//     pricePerDay: { type: Number, default: 0 },
//     /** Monthly rent shown to customer (optional; falls back to pricePerDay-derived UI). */
//     customerRent: { type: Number, default: 0 },
//     /** Vendor's own configured price — shown only in the vendor's product table, never to customers. */
//     vendorRent: { type: Number, default: 0 },
//     shippingCharges: { type: Number, default: 0 },
//   },
//   { _id: false },
// );

// // const productVariantSchema = new mongoose.Schema(
// //   {
// //     variantName: { type: String, trim: true, default: '' },
// //     color: { type: String, trim: true, default: '' },
// //     storage: { type: String, trim: true, default: '' },
// //     ram: { type: String, trim: true, default: '' },
// //     condition: { type: String, trim: true, default: '' },
// //     price: { type: String, trim: true, default: '' },
// //     stock: { type: Number, default: 0 },
// //     variantSpecs: {
// //       type: [{ label: String, value: String }],
// //       default: [],
// //     },
// //   },
// //   // { _id: false },
// // );
// const productVariantSchema = new mongoose.Schema(
//   {
//     variantName: { type: String, trim: true, default: '' },
//     color: { type: String, trim: true, default: '' },
//     storage: { type: String, trim: true, default: '' },
//     ram: { type: String, trim: true, default: '' },
//     condition: { type: String, trim: true, default: '' },
//     price: { type: String, trim: true, default: '' },
//     stock: { type: Number, default: 0 },
//     /** Per-variant sell pricing for custom/manual sell listings (each SKU can price separately). */
//     sellPrice: { type: Number, default: 0 },
//     mrpPrice: { type: Number, default: 0 },
//     /** Per-variant rental tenure pricing for custom/manual rent listings. */
//     rentalConfigurations: {
//       type: [vendorRentalTierSchema],
//       default: [],
//     },
//     /** This variant's OWN images — source of truth, no more guessing/slicing. */
//     images: {
//       type: [String],
//       default: [],
//     },
//     variantSpecs: {
//       type: [{ label: String, value: String }],
//       default: [],
//     },
//   },
//   // { _id: false },
// );

// const reviewSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     rating: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 5,
//     },
//     comment: {
//       type: String,
//       default: '',
//     },
//     images: {
//       type: [String],
//       default: [],
//     },
//     orderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Order',
//       required: true,
//     },
//   },
//   { timestamps: true },
// );

// const productSchema = new mongoose.Schema(
//   {
//     // vendorId: {
//     //   type: mongoose.Schema.Types.ObjectId,
//     //   ref: 'Vendor',
//     //   required: true,
//     // },

//     vendorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Vendor',
//       required: true,
//     },
//     /** Which of the vendor's stores this product is listed under.
//      *  Empty string = legacy product created before store-linking existed. */
//     storeId: {
//       type: String,
//       default: '',
//     },

//     productName: {
//       type: String,
//       required: true,
//     },

//     image: {
//       type: String,
//       required: true,
//     },
//     images: {
//       type: [String],
//       default: [],
//     },

//     price: {
//       type: String, // "1499/month"
//       required: true,
//     },

//     type: {
//       type: String,
//       enum: ['Rental', 'Sell'],
//       required: true,
//     },

//     category: {
//       type: String,
//       required: true,
//     },

//     subCategory: {
//       type: String,
//       required: true,
//     },
//     brand: {
//       type: String,
//       default: '',
//     },
//     // condition: {
//     //   type: String,
//     //   enum: ['Brand New', 'Like New', 'Good', 'Fair', 'Refurbished'],
//     //   default: 'Good',
//     // },
//     condition: {
//       type: String,
//       enum: [
//         'Brand New',
//         'Like New',
//         'Good',
//         'Fair',
//         'Refurbished',
//         'Mint Condition',
//       ],
//       default: 'Good',
//     },
//     shortDescription: {
//       type: String,
//       default: '',
//     },
//     description: {
//       type: String,
//       default: '',
//     },
//     specifications: {
//       type: mongoose.Schema.Types.Mixed,
//       default: {},
//     },
//     variants: {
//       type: [productVariantSchema],
//       default: [],
//     },
//     rentalConfigurations: {
//       type: [vendorRentalTierSchema],
//       default: [],
//     },
//     refundableDeposit: {
//       type: Number,
//       default: 0,
//     },
//     salesConfiguration: {
//       type: {
//         allowVendorEditSalePrice: { type: Boolean, default: true },
//         salePrice: { type: Number, default: 0 },
//         mrpPrice: { type: Number, default: 0 },
//       },
//       default: {},
//     },
//     // logisticsVerification: {
//     //   type: {
//     //     inventoryOwnerName: { type: String, default: '' },
//     //     city: { type: String, default: '' },
//     //     deliveryTimelineValue: { type: Number, default: 0 },
//     //     deliveryTimelineUnit: { type: String, default: 'Days' },
//     //   },
//     //   default: {},
//     // },
//     // AFTER
//     logisticsVerification: {
//       type: {
//         inventoryOwnerName: { type: String, default: '' },
//         city: { type: String, default: '' },
//         deliveryTimelineValue: { type: Number, default: 0 },
//         deliveryTimelineUnit: { type: String, default: 'Days' },
//       },
//       default: {},
//     },
//     // city: {
//     //   type: String,
//     //   default: '',
//     // },

//     /** Vendor listing workflow (separate from stock status). */
//     submissionStatus: {
//       type: String,
//       enum: ['draft', 'pending_approval', 'published'],
//       default: 'published',
//     },
//     /** Admin moderation gate for vendor-created listings. */
//     isAdminApproved: {
//       type: Boolean,
//       default: true,
//     },
//     /** Admin can hide a listing from the public storefront without deleting it. */
//     adminListingEnabled: {
//       type: Boolean,
//       default: true,
//     },
//     /** Vendor can hide an approved listing from the storefront; must stay in sync with admin visibility. */
//     vendorListingEnabled: {
//       type: Boolean,
//       default: true,
//     },
//     adminApprovedAt: {
//       type: Date,
//       default: null,
//     },
//     adminApprovedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Admin',
//     },
//     stock: {
//       type: Number,
//       required: true,
//     },
//     reviews: {
//       type: [reviewSchema],
//       default: [],
//     },

//     averageRating: {
//       type: Number,
//       default: 0,
//     },

//     numReviews: {
//       type: Number,
//       default: 0,
//     },

//     status: {
//       type: String,
//       enum: ['Active', 'Low Stock', 'Out of Stock'],
//       default: 'Active',
//     },
//     /** How this vendor product was created: 'template' (from admin listing) or 'manual'. */
//     createdVia: {
//       type: String,
//       enum: ['template', 'manual'],
//       default: 'manual',
//     },
//     /** Whether admin allowed this vendor listing to edit rental prices (snapshotted at creation). */
//     allowVendorEditRentalPrices: {
//       type: Boolean,
//       default: false,
//     },
//     featured: {
//       enabled: {
//         type: Boolean,
//         default: false,
//         index: true,
//       },

//       priorityRank: {
//         type: Number,
//         default: 0,
//         min: 0,
//         index: true,
//       },

//       status: {
//         type: String,
//         enum: ['live', 'inactive'],
//         default: 'live',
//         index: true,
//       },

//       featuredAt: {
//         type: Date,
//         default: null,
//       },

//       featuredBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Admin',
//         default: null,
//       },
//     },
//   },
//   { timestamps: true },
// );

// export default mongoose.model('Product', productSchema);

import mongoose from 'mongoose';

const vendorRentalTierSchema = new mongoose.Schema(
  {
    months: { type: Number, default: 1 },
    days: { type: Number, default: 0 },
    periodUnit: {
      type: String,
      enum: ['month', 'day'],
      default: 'month',
    },
    label: { type: String, default: '' },
    pricePerDay: { type: Number, default: 0 },
    /** Monthly rent shown to customer (optional; falls back to pricePerDay-derived UI). */
    customerRent: { type: Number, default: 0 },
    /** Vendor's own configured price — shown only in the vendor's product table, never to customers. */
    vendorRent: { type: Number, default: 0 },
    shippingCharges: { type: Number, default: 0 },
  },
  { _id: false },
);

// const productVariantSchema = new mongoose.Schema(
//   {
//     variantName: { type: String, trim: true, default: '' },
//     color: { type: String, trim: true, default: '' },
//     storage: { type: String, trim: true, default: '' },
//     ram: { type: String, trim: true, default: '' },
//     condition: { type: String, trim: true, default: '' },
//     price: { type: String, trim: true, default: '' },
//     stock: { type: Number, default: 0 },
//     variantSpecs: {
//       type: [{ label: String, value: String }],
//       default: [],
//     },
//   },
//   // { _id: false },
// );
const productVariantSchema = new mongoose.Schema(
  {
    variantName: { type: String, trim: true, default: '' },
    color: { type: String, trim: true, default: '' },
    storage: { type: String, trim: true, default: '' },
    ram: { type: String, trim: true, default: '' },
    condition: { type: String, trim: true, default: '' },
    price: { type: String, trim: true, default: '' },
    stock: { type: Number, default: 0 },
    /** Per-variant sell pricing for custom/manual sell listings (each SKU can price separately). */
    sellPrice: { type: Number, default: 0 },
    mrpPrice: { type: Number, default: 0 },
    /** Per-variant rental tenure pricing for custom/manual rent listings. */
    rentalConfigurations: {
      type: [vendorRentalTierSchema],
      default: [],
    },
    /** This variant's OWN images — source of truth, no more guessing/slicing. */
    images: {
      type: [String],
      default: [],
    },
    variantSpecs: {
      type: [{ label: String, value: String }],
      default: [],
    },
  },
  // { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    // vendorId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Vendor',
    //   required: true,
    // },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    /** Which of the vendor's stores this product is listed under.
     *  Empty string = legacy product created before store-linking existed. */
    storeId: {
      type: String,
      default: '',
    },

    productName: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },

    price: {
      type: String, // "1499/month"
      required: true,
    },

    type: {
      type: String,
      enum: ['Rental', 'Sell'],
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    subCategory: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: '',
    },
    // condition: {
    //   type: String,
    //   enum: ['Brand New', 'Like New', 'Good', 'Fair', 'Refurbished'],
    //   default: 'Good',
    // },
    condition: {
      type: String,
      enum: [
        'Brand New',
        'Like New',
        'Good',
        'Fair',
        'Refurbished',
        'Mint Condition',
      ],
      default: 'Good',
    },
    shortDescription: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    variants: {
      type: [productVariantSchema],
      default: [],
    },
    rentalConfigurations: {
      type: [vendorRentalTierSchema],
      default: [],
    },
    refundableDeposit: {
      type: Number,
      default: 0,
    },
    salesConfiguration: {
      type: {
        allowVendorEditSalePrice: { type: Boolean, default: true },
        salePrice: { type: Number, default: 0 },
        mrpPrice: { type: Number, default: 0 },
      },
      default: {},
    },
    // logisticsVerification: {
    //   type: {
    //     inventoryOwnerName: { type: String, default: '' },
    //     city: { type: String, default: '' },
    //     deliveryTimelineValue: { type: Number, default: 0 },
    //     deliveryTimelineUnit: { type: String, default: 'Days' },
    //   },
    //   default: {},
    // },
    // AFTER
    logisticsVerification: {
      type: {
        inventoryOwnerName: { type: String, default: '' },
        city: { type: String, default: '' },
        deliveryTimelineValue: { type: Number, default: 0 },
        deliveryTimelineUnit: { type: String, default: 'Days' },
      },
      default: {},
    },
    // city: {
    //   type: String,
    //   default: '',
    // },

    /** Vendor listing workflow (separate from stock status). */
    submissionStatus: {
      type: String,
      enum: ['draft', 'pending_approval', 'published'],
      default: 'published',
    },
    /** Admin moderation gate for vendor-created listings. */
    isAdminApproved: {
      type: Boolean,
      default: true,
    },
    /** Admin can hide a listing from the public storefront without deleting it. */
    adminListingEnabled: {
      type: Boolean,
      default: true,
    },
    // /** Vendor can hide an approved listing from the storefront; must stay in sync with admin visibility. */
    // vendorListingEnabled: {
    //   type: Boolean,
    //   default: true,
    // },

    /** Vendor can hide an approved listing from the storefront; must stay in sync with admin visibility. */
    vendorListingEnabled: {
      type: Boolean,
      default: true,
    },
    /** Soft-delete flag. When a vendor "deletes" a product, we never remove the
     * document — we just hide it everywhere new discovery happens, so any
     * existing order (rent/buy/service) can still populate this product's
     * details on the user side. */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    adminApprovedAt: {
      type: Date,
      default: null,
    },
    adminApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    stock: {
      type: Number,
      required: true,
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['Active', 'Low Stock', 'Out of Stock'],
      default: 'Active',
    },
    /** How this vendor product was created: 'template' (from admin listing) or 'manual'. */
    createdVia: {
      type: String,
      enum: ['template', 'manual'],
      default: 'manual',
    },
    /** Whether admin allowed this vendor listing to edit rental prices (snapshotted at creation). */
    allowVendorEditRentalPrices: {
      type: Boolean,
      default: false,
    },
    featured: {
      enabled: {
        type: Boolean,
        default: false,
        index: true,
      },

      priorityRank: {
        type: Number,
        default: 0,
        min: 0,
        index: true,
      },

      status: {
        type: String,
        enum: ['live', 'inactive'],
        default: 'live',
        index: true,
      },

      featuredAt: {
        type: Date,
        default: null,
      },

      featuredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null,
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model('Product', productSchema);
