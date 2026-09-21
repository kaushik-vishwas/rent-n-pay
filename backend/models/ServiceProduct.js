// import mongoose from 'mongoose';

// const availabilitySlotSchema = new mongoose.Schema(
//   {
//     day: {
//       type: String,
//       enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//       default: 'Mon',
//     },
//     startTime: { type: String, default: '' },
//     endTime: { type: String, default: '' },
//     isAvailable: { type: Boolean, default: true },
//     workDuration: { type: String, default: '' },
//     breakStart: { type: String, default: '' },
//     breakEnd: { type: String, default: '' },
//   },
//   { _id: false },
// );

// const serviceProductSchema = new mongoose.Schema(
//   {
//     vendorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Vendor',
//       required: true,
//     },

//     /** Which of the vendor's stores this service is listed under.
//      *  Empty string = legacy service created before store-linking existed. */
//     storeId: {
//       type: String,
//       default: '',
//     },

//     serviceTemplateId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'ServiceListingTemplate',
//       default: null,
//     },

//     productName: { type: String, required: true },

//     image: { type: String, required: true },
//     images: { type: [String], default: [] },

//     /**
//      * For vendor UI price label.
//      * Store as string like "₹145000" or "₹145000/yr" to match UI helper.
//      */
//     price: { type: String, required: true, default: '₹0' },

//     type: {
//       type: String,
//       enum: ['Service'],
//       required: true,
//       default: 'Service',
//     },

//     category: { type: String, required: true },
//     subCategory: { type: String, required: true },
//     brand: { type: String, default: '' },
//     condition: {
//       type: String,
//       enum: ['Brand New', 'Refurbished'],
//       default: 'Brand New',
//     },

//     shortDescription: { type: String, default: '' },
//     description: { type: String, default: '' },

//     specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
//     productCustomSpecs: { type: [Object], default: [] },

//     serviceMeta: { type: mongoose.Schema.Types.Mixed, default: {} },

//     availabilitySchedule: { type: [availabilitySlotSchema], default: [] },

//     logisticsVerification: {
//       type: {
//         inventoryOwnerName: { type: String, default: '' },
//         city: { type: String, default: '' },
//         deliveryTimelineValue: { type: Number, default: 0 },
//         deliveryTimelineUnit: { type: String, default: 'Days' },
//       },
//       default: {},
//     },

//     salesConfiguration: {
//       type: {
//         allowVendorEditSalePrice: { type: Boolean, default: true },
//         salePrice: { type: Number, default: 0 },
//         mrpPrice: { type: Number, default: 0 },
//       },
//       default: {},
//     },

//     refundableDeposit: { type: Number, default: 0 },

//     submissionStatus: {
//       type: String,
//       enum: ['draft', 'pending_approval', 'published'],
//       default: 'published',
//     },

//     // Admin moderation gate for vendor-created listings.
//     isAdminApproved: { type: Boolean, default: true },

//     adminListingEnabled: { type: Boolean, default: true },
//     vendorListingEnabled: { type: Boolean, default: true },

//     adminApprovedAt: { type: Date, default: null },
//     adminApprovedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Admin',
//       default: null,
//     },

//     stock: { type: Number, required: true, default: 0 },
//     status: {
//       type: String,
//       enum: ['Active', 'Low Stock', 'Out of Stock'],
//       default: 'Active',
//     },

//     /** How this service product was created: 'template' (from admin) or 'manual'. */
//     createdVia: {
//       type: String,
//       enum: ['template', 'manual'],
//       default: 'template',
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
//     reviews: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//         bookingId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: 'ServiceBooking',
//         },
//         name: { type: String, default: '' },
//         rating: { type: Number, required: true, min: 1, max: 5 },
//         comment: { type: String, default: '' },
//         tags: { type: [String], default: [] },
//         images: { type: [String], default: [] },
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//     averageRating: { type: Number, default: 0 },
//     numReviews: { type: Number, default: 0 },
//   },

//   { timestamps: true },
// );

// export default mongoose.model('ServiceProduct', serviceProductSchema);

import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      default: 'Mon',
    },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    workDuration: { type: String, default: '' },
    breakStart: { type: String, default: '' },
    breakEnd: { type: String, default: '' },
  },
  { _id: false },
);

const serviceProductSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },

    /** Which of the vendor's stores this service is listed under.
     *  Empty string = legacy service created before store-linking existed. */
    storeId: {
      type: String,
      default: '',
    },

    serviceTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceListingTemplate',
      default: null,
    },

    productName: { type: String, required: true },

    image: { type: String, required: true },
    images: { type: [String], default: [] },

    /**
     * For vendor UI price label.
     * Store as string like "₹145000" or "₹145000/yr" to match UI helper.
     */
    price: { type: String, required: true, default: '₹0' },

    type: {
      type: String,
      enum: ['Service'],
      required: true,
      default: 'Service',
    },

    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    brand: { type: String, default: '' },
    condition: {
      type: String,
      enum: ['Brand New', 'Refurbished'],
      default: 'Brand New',
    },

    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },

    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    productCustomSpecs: { type: [Object], default: [] },

    serviceMeta: { type: mongoose.Schema.Types.Mixed, default: {} },

    availabilitySchedule: { type: [availabilitySlotSchema], default: [] },

    logisticsVerification: {
      type: {
        inventoryOwnerName: { type: String, default: '' },
        city: { type: String, default: '' },
        deliveryTimelineValue: { type: Number, default: 0 },
        deliveryTimelineUnit: { type: String, default: 'Days' },
      },
      default: {},
    },

    salesConfiguration: {
      type: {
        allowVendorEditSalePrice: { type: Boolean, default: true },
        salePrice: { type: Number, default: 0 },
        mrpPrice: { type: Number, default: 0 },
      },
      default: {},
    },

    refundableDeposit: { type: Number, default: 0 },

    submissionStatus: {
      type: String,
      enum: ['draft', 'pending_approval', 'published'],
      default: 'published',
    },

    // Admin moderation gate for vendor-created listings.
    isAdminApproved: { type: Boolean, default: true },

    adminListingEnabled: { type: Boolean, default: true },
    vendorListingEnabled: { type: Boolean, default: true },

    /** Soft-delete flag. When a vendor "deletes" a service, we never remove
     * the document — we just hide it everywhere new discovery happens, so
     * any existing booking/order can still populate this service's details
     * on the user side. */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    adminApprovedAt: { type: Date, default: null },
    adminApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },

    stock: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Active', 'Low Stock', 'Out of Stock'],
      default: 'Active',
    },

    /** How this service product was created: 'template' (from admin) or 'manual'. */
    createdVia: {
      type: String,
      enum: ['template', 'manual'],
      default: 'template',
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
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ServiceBooking',
        },
        name: { type: String, default: '' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '' },
        tags: { type: [String], default: [] },
        images: { type: [String], default: [] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },

  { timestamps: true },
);

export default mongoose.model('ServiceProduct', serviceProductSchema);
