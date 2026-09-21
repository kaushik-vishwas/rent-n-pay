// import Wishlist from '../../models/Wishlist.js';

// export const getWishlistAnalytics = async (req, res) => {
//   try {
//     const topProducts = await Wishlist.aggregate([
//       {
//         $lookup: {
//           from: 'products',
//           localField: 'productId',
//           foreignField: '_id',
//           as: 'product',
//         },
//       },
//       { $unwind: '$product' },
//       { $match: { 'product.submissionStatus': { $ne: 'draft' } } },
//       {
//         $group: {
//           _id: '$productId',
//           totalWishlists: { $sum: 1 },
//           latestAt: { $max: '$createdAt' },
//         },
//       },
//       { $sort: { totalWishlists: -1, latestAt: -1 } },
//       { $limit: 50 },
//       {
//         $lookup: {
//           from: 'products',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'product',
//         },
//       },
//       { $unwind: '$product' },
//       {
//         $lookup: {
//           from: 'vendors',
//           localField: 'product.vendorId',
//           foreignField: '_id',
//           as: 'vendor',
//         },
//       },
//       {
//         $addFields: {
//           vendorName: {
//             $ifNull: [{ $arrayElemAt: ['$vendor.fullName', 0] }, 'Vendor'],
//           },
//         },
//       },
//       {
//         $addFields: {
//           allRentalConfigs: {
//             $concatArrays: [
//               { $ifNull: ['$product.rentalConfigurations', []] },
//               {
//                 $reduce: {
//                   input: { $ifNull: ['$product.variants', []] },
//                   initialValue: [],
//                   in: {
//                     $concatArrays: [
//                       '$$value',
//                       { $ifNull: ['$$this.rentalConfigurations', []] },
//                     ],
//                   },
//                 },
//               },
//             ],
//           },
//         },
//       },
//       {
//         $addFields: {
//           validRentalConfigs: {
//             $filter: {
//               input: '$allRentalConfigs',
//               as: 'cfg',
//               cond: {
//                 $gt: [
//                   {
//                     $ifNull: [
//                       '$$cfg.customerRent',
//                       { $ifNull: ['$$cfg.pricePerDay', 0] },
//                     ],
//                   },
//                   0,
//                 ],
//               },
//             },
//           },
//           firstVariantSellPrice: {
//             $let: {
//               vars: {
//                 priced: {
//                   $filter: {
//                     input: { $ifNull: ['$product.variants', []] },
//                     as: 'v',
//                     cond: { $gt: [{ $ifNull: ['$$v.sellPrice', 0] }, 0] },
//                   },
//                 },
//               },
//               in: { $ifNull: [{ $arrayElemAt: ['$$priced.sellPrice', 0] }, 0] },
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           lowestRentalAmount: {
//             $min: {
//               $map: {
//                 input: '$validRentalConfigs',
//                 as: 'cfg',
//                 in: { $ifNull: ['$$cfg.customerRent', '$$cfg.pricePerDay'] },
//               },
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           computedPrice: {
//             $cond: [
//               { $eq: ['$product.type', 'Rental'] },
//               {
//                 $cond: [
//                   { $gt: ['$lowestRentalAmount', 0] },
//                   {
//                     $concat: [
//                       '₹',
//                       { $toString: '$lowestRentalAmount' },
//                       '/month',
//                     ],
//                   },
//                   '—',
//                 ],
//               },
//               {
//                 $let: {
//                   vars: {
//                     sellPrice: {
//                       $cond: [
//                         {
//                           $gt: [
//                             {
//                               $ifNull: [
//                                 '$product.salesConfiguration.salePrice',
//                                 0,
//                               ],
//                             },
//                             0,
//                           ],
//                         },
//                         '$product.salesConfiguration.salePrice',
//                         {
//                           $cond: [
//                             {
//                               $gt: [
//                                 {
//                                   $toDouble: { $ifNull: ['$product.price', 0] },
//                                 },
//                                 0,
//                               ],
//                             },
//                             { $toDouble: { $ifNull: ['$product.price', 0] } },
//                             '$firstVariantSellPrice',
//                           ],
//                         },
//                       ],
//                     },
//                   },
//                   in: {
//                     $cond: [
//                       { $gt: ['$$sellPrice', 0] },
//                       { $concat: ['₹', { $toString: '$$sellPrice' }] },
//                       '—',
//                     ],
//                   },
//                 },
//               },
//             ],
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           productId: '$product._id',
//           totalWishlists: 1,
//           productName: '$product.productName',
//           productImage: '$product.image',
//           category: '$product.category',
//           price: '$computedPrice',
//           stock: '$product.stock',
//           vendorName: 1,
//         },
//       },
//     ]);

//     const topUsers = await Wishlist.aggregate([
//       {
//         $lookup: {
//           from: 'products',
//           localField: 'productId',
//           foreignField: '_id',
//           as: 'product',
//         },
//       },
//       { $unwind: '$product' },
//       { $match: { 'product.submissionStatus': { $ne: 'draft' } } },
//       {
//         $group: {
//           _id: '$userId',
//           totalWishlists: { $sum: 1 },
//           latestAt: { $max: '$createdAt' },
//         },
//       },
//       { $sort: { totalWishlists: -1, latestAt: -1 } },
//       { $limit: 20 },
//       {
//         $lookup: {
//           from: 'users',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'user',
//         },
//       },
//       { $unwind: '$user' },
//       {
//         $project: {
//           _id: 0,
//           userId: '$user._id',
//           fullName: '$user.fullName',
//           emailAddress: '$user.emailAddress',
//           totalWishlists: 1,
//         },
//       },
//     ]);

//     const totalWishlistedItems = await Wishlist.aggregate([
//       {
//         $lookup: {
//           from: 'products',
//           localField: 'productId',
//           foreignField: '_id',
//           as: 'product',
//         },
//       },
//       { $unwind: '$product' },
//       { $match: { 'product.submissionStatus': { $ne: 'draft' } } },
//       { $count: 'total' },
//     ]).then((r) => r[0]?.total || 0);

//     const topCategoryAgg = await Wishlist.aggregate([
//       {
//         $lookup: {
//           from: 'products',
//           localField: 'productId',
//           foreignField: '_id',
//           as: 'product',
//         },
//       },
//       { $unwind: '$product' },
//       {
//         $group: {
//           _id: '$product.category',
//           count: { $sum: 1 },
//         },
//       },
//       { $sort: { count: -1 } },
//       { $limit: 1 },
//     ]);

//     const mostWishlistedCategory = topCategoryAgg[0]?._id || '—';
//     const mostWishlistedCategoryCount = topCategoryAgg[0]?.count || 0;

//     return res.json({
//       summary: {
//         totalWishlistedItems,
//         mostWishlistedCategory,
//         mostWishlistedCategoryCount,
//         topWishlistUsers: topUsers.length,
//       },
//       topProducts,
//       topUsers,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

import Wishlist from '../../models/Wishlist.js';
import { getCityProductIds } from '../../utils/cityScope.js';

export const getWishlistAnalytics = async (req, res) => {
  try {
    const cityProductIds = await getCityProductIds(req);
    const productMatchStage = cityProductIds
      ? {
          'product.submissionStatus': { $ne: 'draft' },
          'product._id': { $in: cityProductIds },
        }
      : { 'product.submissionStatus': { $ne: 'draft' } };

    const topProducts = await Wishlist.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $match: productMatchStage },
      {
        $group: {
          _id: '$productId',
          totalWishlists: { $sum: 1 },
          latestAt: { $max: '$createdAt' },
        },
      },
      { $sort: { totalWishlists: -1, latestAt: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'vendors',
          localField: 'product.vendorId',
          foreignField: '_id',
          as: 'vendor',
        },
      },
      {
        $addFields: {
          vendorName: {
            $ifNull: [{ $arrayElemAt: ['$vendor.fullName', 0] }, 'Vendor'],
          },
        },
      },
      {
        $addFields: {
          allRentalConfigs: {
            $concatArrays: [
              { $ifNull: ['$product.rentalConfigurations', []] },
              {
                $reduce: {
                  input: { $ifNull: ['$product.variants', []] },
                  initialValue: [],
                  in: {
                    $concatArrays: [
                      '$$value',
                      { $ifNull: ['$$this.rentalConfigurations', []] },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          validRentalConfigs: {
            $filter: {
              input: '$allRentalConfigs',
              as: 'cfg',
              cond: {
                $gt: [
                  {
                    $ifNull: [
                      '$$cfg.customerRent',
                      { $ifNull: ['$$cfg.pricePerDay', 0] },
                    ],
                  },
                  0,
                ],
              },
            },
          },
          firstVariantSellPrice: {
            $let: {
              vars: {
                priced: {
                  $filter: {
                    input: { $ifNull: ['$product.variants', []] },
                    as: 'v',
                    cond: { $gt: [{ $ifNull: ['$$v.sellPrice', 0] }, 0] },
                  },
                },
              },
              in: { $ifNull: [{ $arrayElemAt: ['$$priced.sellPrice', 0] }, 0] },
            },
          },
        },
      },
      {
        $addFields: {
          lowestRentalAmount: {
            $min: {
              $map: {
                input: '$validRentalConfigs',
                as: 'cfg',
                in: { $ifNull: ['$$cfg.customerRent', '$$cfg.pricePerDay'] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          computedPrice: {
            $cond: [
              { $eq: ['$product.type', 'Rental'] },
              {
                $cond: [
                  { $gt: ['$lowestRentalAmount', 0] },
                  {
                    $concat: [
                      '₹',
                      { $toString: '$lowestRentalAmount' },
                      '/month',
                    ],
                  },
                  '—',
                ],
              },
              {
                $let: {
                  vars: {
                    sellPrice: {
                      $cond: [
                        {
                          $gt: [
                            {
                              $ifNull: [
                                '$product.salesConfiguration.salePrice',
                                0,
                              ],
                            },
                            0,
                          ],
                        },
                        '$product.salesConfiguration.salePrice',
                        {
                          $cond: [
                            {
                              $gt: [
                                {
                                  $toDouble: { $ifNull: ['$product.price', 0] },
                                },
                                0,
                              ],
                            },
                            { $toDouble: { $ifNull: ['$product.price', 0] } },
                            '$firstVariantSellPrice',
                          ],
                        },
                      ],
                    },
                  },
                  in: {
                    $cond: [
                      { $gt: ['$$sellPrice', 0] },
                      { $concat: ['₹', { $toString: '$$sellPrice' }] },
                      '—',
                    ],
                  },
                },
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          productId: '$product._id',
          totalWishlists: 1,
          productName: '$product.productName',
          productImage: '$product.image',
          category: '$product.category',
          price: '$computedPrice',
          stock: '$product.stock',
          vendorName: 1,
        },
      },
    ]);

    const topUsers = await Wishlist.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $match: productMatchStage },
      {
        $group: {
          _id: '$userId',
          totalWishlists: { $sum: 1 },
          latestAt: { $max: '$createdAt' },
        },
      },
      { $sort: { totalWishlists: -1, latestAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$user._id',
          fullName: '$user.fullName',
          emailAddress: '$user.emailAddress',
          totalWishlists: 1,
        },
      },
    ]);

    const totalWishlistedItems = await Wishlist.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $match: productMatchStage },
      { $count: 'total' },
    ]).then((r) => r[0]?.total || 0);

    const topCategoryAgg = await Wishlist.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      ...(cityProductIds
        ? [{ $match: { 'product._id': { $in: cityProductIds } } }]
        : []),
      {
        $group: {
          _id: '$product.category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const mostWishlistedCategory = topCategoryAgg[0]?._id || '—';
    const mostWishlistedCategoryCount = topCategoryAgg[0]?.count || 0;

    return res.json({
      summary: {
        totalWishlistedItems,
        mostWishlistedCategory,
        mostWishlistedCategoryCount,
        topWishlistUsers: topUsers.length,
      },
      topProducts,
      topUsers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
