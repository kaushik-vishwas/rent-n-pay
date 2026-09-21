// import Order from '../../models/Order.js';

// export const getLifelineDistribution = async (req, res) => {
//   try {
//     const days = parseInt(req.query.days, 10);
//     const matchStage = { status: { $ne: 'cancelled' } };

//     if (!isNaN(days) && days > 0) {
//       const fromDate = new Date();
//       fromDate.setDate(fromDate.getDate() - days);
//       matchStage.createdAt = { $gte: fromDate };
//     }

//     const pipeline = [
//       { $match: matchStage },

//       {
//         $addFields: {
//           tenureBucket: {
//             $switch: {
//               branches: [
//                 { case: { $eq: ['$tenureUnit', 'day'] }, then: 'Daily' },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 3] },
//                     ],
//                   },
//                   then: '03 Months',
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 6] },
//                     ],
//                   },
//                   then: '06 Months',
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 9] },
//                     ],
//                   },
//                   then: '09 Months',
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 12] },
//                     ],
//                   },
//                   then: 'Annual',
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 15] },
//                     ],
//                   },
//                   then: '15 Months',
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 18] },
//                     ],
//                   },
//                   then: '18 Months',
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 21] },
//                     ],
//                   },
//                   then: '21 Months',
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 24] },
//                     ],
//                   },
//                   then: '24 Months',
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 27] },
//                     ],
//                   },
//                   then: '27 Months',
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 30] },
//                     ],
//                   },
//                   then: '30 Months',
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 33] },
//                     ],
//                   },
//                   then: '33 Months',
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ['$tenureUnit', 'month'] },
//                       { $eq: ['$rentalDuration', 36] },
//                     ],
//                   },
//                   then: '36 Months',
//                 },
//               ],
//               default: 'Other',
//             },
//           },
//         },
//       },

//       { $group: { _id: '$tenureBucket', count: { $sum: 1 } } },
//     ];

//     const results = await Order.aggregate(pipeline);

//     const map = Object.fromEntries(results.map((r) => [r._id, r.count]));

//     const labelOrder = [
//       '36 Months',
//       '33 Months',
//       '30 Months',
//       '27 Months',
//       '24 Months',
//       '21 Months',
//       '18 Months',
//       '15 Months',
//       'Annual',
//       '09 Months',
//       '06 Months',
//       '03 Months',
//       'Daily',
//     ];

//     const total =
//       labelOrder.reduce((sum, label) => sum + (map[label] || 0), 0) || 1;

//     const data = labelOrder
//       .map((label) => ({
//         tenure: label,
//         count: map[label] || 0,
//         percentage: Math.round(((map[label] || 0) / total) * 10000) / 100,
//       }))
//       .filter((item) => item.count > 0);

//     console.log('Unmatched tenure orders (Other):', map['Other'] || 0);

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error('Lifeline analytics error:', err);
//     res
//       .status(500)
//       .json({ success: false, message: 'Failed to fetch lifeline data' });
//   }
// };

import Order from '../../models/Order.js';
import { getCityProductIds } from '../../utils/cityScope.js';

export const getLifelineDistribution = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10);
    const matchStage = { status: { $ne: 'cancelled' } };

    if (!isNaN(days) && days > 0) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      matchStage.createdAt = { $gte: fromDate };
    }

    const cityProductIds = await getCityProductIds(req);
    if (cityProductIds) {
      matchStage['products.product'] = { $in: cityProductIds };
    }

    const pipeline = [
      { $match: matchStage },

      {
        $addFields: {
          tenureBucket: {
            $switch: {
              branches: [
                { case: { $eq: ['$tenureUnit', 'day'] }, then: 'Daily' },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 3] },
                    ],
                  },
                  then: '03 Months',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 6] },
                    ],
                  },
                  then: '06 Months',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 9] },
                    ],
                  },
                  then: '09 Months',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 12] },
                    ],
                  },
                  then: 'Annual',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 15] },
                    ],
                  },
                  then: '15 Months',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 18] },
                    ],
                  },
                  then: '18 Months',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 21] },
                    ],
                  },
                  then: '21 Months',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 24] },
                    ],
                  },
                  then: '24 Months',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 27] },
                    ],
                  },
                  then: '27 Months',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 30] },
                    ],
                  },
                  then: '30 Months',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 33] },
                    ],
                  },
                  then: '33 Months',
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$tenureUnit', 'month'] },
                      { $eq: ['$rentalDuration', 36] },
                    ],
                  },
                  then: '36 Months',
                },
              ],
              default: 'Other',
            },
          },
        },
      },

      { $group: { _id: '$tenureBucket', count: { $sum: 1 } } },
    ];

    const results = await Order.aggregate(pipeline);

    const map = Object.fromEntries(results.map((r) => [r._id, r.count]));

    const labelOrder = [
      '36 Months',
      '33 Months',
      '30 Months',
      '27 Months',
      '24 Months',
      '21 Months',
      '18 Months',
      '15 Months',
      'Annual',
      '09 Months',
      '06 Months',
      '03 Months',
      'Daily',
      'Other',
    ];

    const total =
      labelOrder.reduce((sum, label) => sum + (map[label] || 0), 0) || 1;

    const data = labelOrder
      .map((label) => ({
        tenure: label,
        count: map[label] || 0,
        percentage: Math.round(((map[label] || 0) / total) * 10000) / 100,
      }))
      .filter((item) => item.count > 0);

    console.log('Unmatched tenure orders (Other):', map['Other'] || 0);

    res.json({ success: true, data });
  } catch (err) {
    console.error('Lifeline analytics error:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch lifeline data' });
  }
};
