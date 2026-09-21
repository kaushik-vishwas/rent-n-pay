import ServiceBooking from '../models/ServiceBooking.js';
import ServiceProduct from '../models/ServiceProduct.js';
import Offer from '../models/Offer.js';
import { getNextSequence } from '../utils/getNextSequence.js';

const URGENT_FEE = 150;

function parseMoney(value) {
  const cleaned = String(value || '').replace(/[^\d.]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function isValidSlot(slot) {
  return Boolean(
    slot &&
    String(slot.from || '').trim() &&
    String(slot.to || '').trim() &&
    String(slot.label || '').trim(),
  );
}

function isSlotWithinAvailability(date, timeSlot, availabilitySchedule = []) {
  if (
    !Array.isArray(availabilitySchedule) ||
    availabilitySchedule.length === 0
  ) {
    return true;
  }
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = dayNames[date.getDay()];
  const schedule = availabilitySchedule.find((slot) => slot?.day === day);
  if (!schedule || schedule.isAvailable === false) return false;

  const from = String(timeSlot?.from || '').trim();
  const to = String(timeSlot?.to || '').trim();
  return (
    from >= String(schedule.startTime || '').trim() &&
    to <= String(schedule.endTime || '').trim()
  );
}

function normalizeBookingDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function addressLineFromBody(body) {
  const direct = String(body?.address || '').trim();
  if (direct) return direct;
  const selected = body?.selectedAddress || {};
  return [
    selected.addressLine,
    selected.area,
    selected.city,
    selected.pincode ? `- ${selected.pincode}` : '',
  ]
    .map((x) => String(x || '').trim())
    .filter(Boolean)
    .join(', ');
}

async function assertSlotCapacity(
  serviceProductId,
  bookingDate,
  timeSlot,
  stock,
) {
  const capacity = Math.max(1, Number(stock || 1));
  const existingCount = await ServiceBooking.countDocuments({
    serviceProduct: serviceProductId,
    bookingDate,
    'timeSlot.from': String(timeSlot.from).trim(),
    'timeSlot.to': String(timeSlot.to).trim(),
    status: { $ne: 'cancelled' },
    paymentStatus: { $ne: 'failed' },
  });
  return existingCount < capacity;
}

function bookingPopulateQuery(query) {
  return query
    .populate('user', 'fullName emailAddress mobileNumber')
    .populate('vendor', 'fullName emailAddress')
    .populate(
      'serviceProduct',
      'productName image vendorId category subCategory',
    );
}

// export const createServiceBooking = async (req, res) => {
//   try {
//     // const {
//     //   productId,
//     //   bookingDate,
//     //   timeSlot,
//     //   isUrgent,
//     //   totalAmount,
//     //   paymentMethod,
//     //   customerNotes,
//     // } = req.body || {};
//     const {
//       productId,
//       bookingDate,
//       timeSlot,
//       isUrgent,
//       totalAmount,
//       paymentMethod,
//       customerNotes,
//       taxLines,
//       taxBreakdown,
//     } = req.body || {};

//     if (!productId || !bookingDate || !isValidSlot(timeSlot)) {
//       return res.status(400).json({
//         message: 'Service, booking date and time slot are required.',
//       });
//     }

//     const parsedBookingDate = normalizeBookingDate(bookingDate);
//     if (!parsedBookingDate) {
//       return res.status(400).json({ message: 'Invalid booking date.' });
//     }

//     const today = normalizeBookingDate(new Date());

//     if (parsedBookingDate < today) {
//       return res
//         .status(400)
//         .json({ message: 'Booking date cannot be in the past.' });
//     }

//     const serviceProduct = await ServiceProduct.findOne({
//       _id: productId,
//       isAdminApproved: true,
//       submissionStatus: 'published',
//       vendorListingEnabled: true,
//       adminListingEnabled: true,
//     });

//     if (!serviceProduct) {
//       return res.status(404).json({ message: 'Service not available.' });
//     }

//     if (String(serviceProduct.status || '').toLowerCase() === 'out of stock') {
//       return res
//         .status(400)
//         .json({ message: 'Service is currently unavailable.' });
//     }

//     if (
//       !isSlotWithinAvailability(
//         parsedBookingDate,
//         timeSlot,
//         serviceProduct.availabilitySchedule,
//       )
//     ) {
//       return res.status(400).json({
//         message: 'This service is not available for the selected slot.',
//       });
//     }

//     const hasCapacity = await assertSlotCapacity(
//       serviceProduct._id,
//       parsedBookingDate,
//       timeSlot,
//       serviceProduct.stock,
//     );
//     if (!hasCapacity) {
//       return res.status(400).json({
//         message: 'This slot is full. Please select another time slot.',
//       });
//     }

//     // const baseAmount = Math.max(
//     //   0,
//     //   Number(serviceProduct.salesConfiguration?.salePrice || 0) ||
//     //     parseMoney(serviceProduct.price),
//     // );
//     // const urgentFee = isUrgent ? URGENT_FEE : 0;
//     // const expectedTotal = baseAmount + urgentFee;
//     // const paidAmount = Math.max(0, Number(totalAmount || expectedTotal));

//     // if (paidAmount !== expectedTotal) {
//     //   return res.status(400).json({
//     //     message: 'Payment amount does not match the selected service.',
//     //   });
//     // }

//     const baseAmount = Math.max(
//       0,
//       Number(serviceProduct.salesConfiguration?.salePrice || 0) ||
//         parseMoney(serviceProduct.price),
//     );
//     const urgentFee = isUrgent ? URGENT_FEE : 0;

//     const safeTaxBreakdown =
//       taxBreakdown && typeof taxBreakdown === 'object' ? taxBreakdown : {};
//     const taxAmount = Object.values(safeTaxBreakdown).reduce(
//       (sum, v) => sum + Math.max(0, Number(v) || 0),
//       0,
//     );

//     const expectedTotal = baseAmount + urgentFee + taxAmount;
//     const paidAmount = Math.max(0, Number(totalAmount || expectedTotal));

//     if (paidAmount !== expectedTotal) {
//       return res.status(400).json({
//         message: 'Payment amount does not match the selected service.',
//       });
//     }

//     const address = addressLineFromBody(req.body);
//     const phone = String(
//       req.body?.phone || req.body?.selectedAddress?.phone || '',
//     ).trim();
//     const name = String(
//       req.body?.name ||
//         req.body?.selectedAddress?.fullName ||
//         req.user?.fullName ||
//         '',
//     ).trim();

//     if (!address || !phone || !name) {
//       return res.status(400).json({
//         message: 'Name, phone and service address are required.',
//       });
//     }

//     const booking = await ServiceBooking.create({
//       user: req.user._id,
//       vendor: serviceProduct.vendorId,
//       serviceProduct: serviceProduct._id,
//       serviceSnapshot: {
//         productName: serviceProduct.productName,
//         image: serviceProduct.image,
//         category: serviceProduct.category,
//         subCategory: serviceProduct.subCategory,
//         serviceType: serviceProduct.serviceMeta?.serviceType || '',
//         serviceProductId: String(serviceProduct._id),
//       },
//       bookingDate: parsedBookingDate,
//       timeSlot: {
//         from: String(timeSlot.from).trim(),
//         to: String(timeSlot.to).trim(),
//         label: String(timeSlot.label).trim(),
//       },
//       // isUrgent: Boolean(isUrgent),
//       // baseAmount,
//       // urgentFee,
//       // totalAmount: expectedTotal,
//       isUrgent: Boolean(isUrgent),
//       baseAmount,
//       urgentFee,
//       taxAmount,
//       taxBreakdown: safeTaxBreakdown,
//       taxLines: Array.isArray(taxLines) ? taxLines : [],
//       totalAmount: expectedTotal,
//       paymentStatus: 'paid',
//       paymentMethod: String(paymentMethod || 'card').trim() || 'card',
//       status: 'pending',
//       address,
//       phone,
//       name,
//       customerNotes: String(customerNotes || '')
//         .trim()
//         .slice(0, 500),
//     });

//     const populated = await bookingPopulateQuery(
//       ServiceBooking.findById(booking._id),
//     );
//     return res.status(201).json(populated);
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };

export const createServiceBooking = async (req, res) => {
  try {
    // const {
    //   productId,
    //   bookingDate,
    //   timeSlot,
    //   isUrgent,
    //   totalAmount,
    //   paymentMethod,
    //   customerNotes,
    // } = req.body || {};
    const {
      productId,
      bookingDate,
      timeSlot,
      isUrgent,
      totalAmount,
      paymentMethod,
      customerNotes,
      taxLines,
      taxBreakdown,
    } = req.body || {};

    if (!productId || !bookingDate || !isValidSlot(timeSlot)) {
      return res.status(400).json({
        message: 'Service, booking date and time slot are required.',
      });
    }

    const parsedBookingDate = normalizeBookingDate(bookingDate);
    if (!parsedBookingDate) {
      return res.status(400).json({ message: 'Invalid booking date.' });
    }

    const today = normalizeBookingDate(new Date());

    if (parsedBookingDate < today) {
      return res
        .status(400)
        .json({ message: 'Booking date cannot be in the past.' });
    }

    const serviceProduct = await ServiceProduct.findOne({
      _id: productId,
      isAdminApproved: true,
      submissionStatus: 'published',
      vendorListingEnabled: true,
      adminListingEnabled: true,
    });

    if (!serviceProduct) {
      return res.status(404).json({ message: 'Service not available.' });
    }

    if (String(serviceProduct.status || '').toLowerCase() === 'out of stock') {
      return res
        .status(400)
        .json({ message: 'Service is currently unavailable.' });
    }

    if (
      !isSlotWithinAvailability(
        parsedBookingDate,
        timeSlot,
        serviceProduct.availabilitySchedule,
      )
    ) {
      return res.status(400).json({
        message: 'This service is not available for the selected slot.',
      });
    }

    const hasCapacity = await assertSlotCapacity(
      serviceProduct._id,
      parsedBookingDate,
      timeSlot,
      serviceProduct.stock,
    );
    if (!hasCapacity) {
      return res.status(400).json({
        message: 'This slot is full. Please select another time slot.',
      });
    }

    // const baseAmount = Math.max(
    //   0,
    //   Number(serviceProduct.salesConfiguration?.salePrice || 0) ||
    //     parseMoney(serviceProduct.price),
    // );
    // const urgentFee = isUrgent ? URGENT_FEE : 0;
    // const expectedTotal = baseAmount + urgentFee;
    // const paidAmount = Math.max(0, Number(totalAmount || expectedTotal));

    // if (paidAmount !== expectedTotal) {
    //   return res.status(400).json({
    //     message: 'Payment amount does not match the selected service.',
    //   });
    // }

    // const baseAmount = Math.max(
    //   0,
    //   Number(serviceProduct.salesConfiguration?.salePrice || 0) ||
    //     parseMoney(serviceProduct.price),
    // );
    // const urgentFee = isUrgent ? URGENT_FEE : 0;

    // const isPayAfterService =
    //   String(paymentMethod || '') === 'pay_after_service';

    // const safeTaxBreakdown =
    //   taxBreakdown && typeof taxBreakdown === 'object' ? taxBreakdown : {};
    // const taxAmount = Object.values(safeTaxBreakdown).reduce(
    //   (sum, v) => sum + Math.max(0, Number(v) || 0),
    //   0,
    // );

    // const expectedTotal = baseAmount + urgentFee + taxAmount;
    // const paidAmount = Math.max(0, Number(totalAmount || expectedTotal));

    // if (paidAmount !== expectedTotal) {
    //   return res.status(400).json({
    //     message: 'Payment amount does not match the selected service.',
    //   });
    // }

    const rawBaseAmount = Math.max(
      0,
      Number(serviceProduct.salesConfiguration?.salePrice || 0) ||
        parseMoney(serviceProduct.price),
    );

    // Apply active vendor offer discount (if any) — same logic as
    // getPublicActiveOffers, scoped to this single service product.
    const now = new Date();
    const activeOffer = await Offer.findOne({
      productId: serviceProduct._id,
      productType: 'ServiceProduct',
      isActive: true,
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    });
    const discountPercent = Number(activeOffer?.discountPercent || 0);
    const baseAmount =
      activeOffer && discountPercent > 0
        ? Math.max(
            0,
            Math.round(rawBaseAmount - (rawBaseAmount * discountPercent) / 100),
          )
        : rawBaseAmount;

    const urgentFee = isUrgent ? URGENT_FEE : 0;

    const isPayAfterService =
      String(paymentMethod || '') === 'pay_after_service';

    const safeTaxBreakdown =
      taxBreakdown && typeof taxBreakdown === 'object' ? taxBreakdown : {};
    const taxAmount = Object.values(safeTaxBreakdown).reduce(
      (sum, v) => sum + Math.max(0, Number(v) || 0),
      0,
    );

    const expectedTotal = baseAmount + urgentFee + taxAmount;
    const paidAmount = Math.max(0, Number(totalAmount || expectedTotal));

    if (paidAmount !== expectedTotal) {
      return res.status(400).json({
        message: 'Payment amount does not match the selected service.',
      });
    }

    const address = addressLineFromBody(req.body);
    const phone = String(
      req.body?.phone || req.body?.selectedAddress?.phone || '',
    ).trim();
    const name = String(
      req.body?.name ||
        req.body?.selectedAddress?.fullName ||
        req.user?.fullName ||
        '',
    ).trim();

    if (!address || !phone || !name) {
      return res.status(400).json({
        message: 'Name, phone and service address are required.',
      });
    }

    const bookingNumber = await getNextSequence('bookingNumber');

    const booking = await ServiceBooking.create({
      bookingNumber,
      user: req.user._id,
      vendor: serviceProduct.vendorId,
      serviceProduct: serviceProduct._id,
      serviceSnapshot: {
        productName: serviceProduct.productName,
        image: serviceProduct.image,
        category: serviceProduct.category,
        subCategory: serviceProduct.subCategory,
        serviceType: serviceProduct.serviceMeta?.serviceType || '',
        serviceProductId: String(serviceProduct._id),
      },
      bookingDate: parsedBookingDate,
      timeSlot: {
        from: String(timeSlot.from).trim(),
        to: String(timeSlot.to).trim(),
        label: String(timeSlot.label).trim(),
      },
      // isUrgent: Boolean(isUrgent),
      // baseAmount,
      // urgentFee,
      // totalAmount: expectedTotal,
      isUrgent: Boolean(isUrgent),
      baseAmount,
      urgentFee,
      taxAmount,
      taxBreakdown: safeTaxBreakdown,
      taxLines: Array.isArray(taxLines) ? taxLines : [],
      totalAmount: expectedTotal,
      paymentStatus: isPayAfterService ? 'pending' : 'paid',
      paymentMethod: String(paymentMethod || 'card').trim() || 'card',
      status: 'pending',
      address,
      phone,
      name,
      customerNotes: String(customerNotes || '')
        .trim()
        .slice(0, 500),
    });

    const populated = await bookingPopulateQuery(
      ServiceBooking.findById(booking._id),
    );
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyServiceBookings = async (req, res) => {
  try {
    const bookings = await bookingPopulateQuery(
      ServiceBooking.find({ user: req.user._id }).sort({ createdAt: -1 }),
    );
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyServiceBookingById = async (req, res) => {
  try {
    const booking = await bookingPopulateQuery(
      ServiceBooking.findOne({ _id: req.params.id, user: req.user._id }),
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    return res.json(booking);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// export const cancelMyServiceBooking = async (req, res) => {
//   try {
//     const booking = await ServiceBooking.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });
//     if (!booking) return res.status(404).json({ message: 'Booking not found' });
//     if (!['pending', 'confirmed'].includes(String(booking.status))) {
//       return res
//         .status(400)
//         .json({ message: 'This booking cannot be cancelled online.' });
//     }
//     booking.status = 'cancelled';
//     booking.cancelledBy = 'user';
//     booking.cancelledAt = new Date();
//     await booking.save();
//     const populated = await bookingPopulateQuery(
//       ServiceBooking.findById(booking._id),
//     );
//     return res.json(populated);
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };

export const cancelMyServiceBooking = async (req, res) => {
  try {
    const booking = await ServiceBooking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!['pending', 'confirmed'].includes(String(booking.status))) {
      return res
        .status(400)
        .json({ message: 'This booking cannot be cancelled online.' });
    }

    // ── late-fee logic ──────────────────────────────────────────────────────
    const now = new Date();
    const bookingDateTime = new Date(booking.bookingDate);

    // timeSlot.from holds the start time e.g. "04:00 PM"
    if (booking.timeSlot?.from) {
      const raw = String(booking.timeSlot.from).trim();
      const isPM = /pm/i.test(raw);
      const isAM = /am/i.test(raw);
      const timePart = raw.replace(/[apm\s]/gi, '');
      let [h, m] = timePart.split(':').map(Number);
      if (isPM || isAM) {
        if (isPM && h !== 12) h += 12;
        if (isAM && h === 12) h = 0;
      }
      bookingDateTime.setHours(h, m, 0, 0);
    }

    // const hoursUntilService = (bookingDateTime - now) / (1000 * 60 * 60);
    // const isLateCancellation = hoursUntilService < 1.5;
    // const totalAmount = Number(booking.totalAmount || 0);
    // const lateFee = isLateCancellation ? Math.round(totalAmount * 0.1) : 0;
    // const refundAmount = totalAmount - lateFee;
    const isPayAfterService = booking.paymentMethod === 'pay_after_service';
    const hoursUntilService = (bookingDateTime - now) / (1000 * 60 * 60);
    const isLateCancellation = hoursUntilService < 1.5;
    const totalAmount = Number(booking.totalAmount || 0);
    const lateFee = isPayAfterService
      ? 0
      : isLateCancellation
        ? Math.round(totalAmount * 0.1)
        : 0;
    const refundAmount = isPayAfterService ? 0 : totalAmount - lateFee;

    booking.status = 'cancelled';
    booking.cancelledBy = 'user';
    booking.cancelledAt = new Date();
    booking.lateFee = lateFee;
    booking.refundAmount = refundAmount;
    await booking.save();

    const populated = await bookingPopulateQuery(
      ServiceBooking.findById(booking._id),
    );
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getServiceBookingAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingDate = normalizeBookingDate(req.query?.date);
    if (!bookingDate) {
      return res
        .status(400)
        .json({ message: 'Valid booking date is required.' });
    }

    const serviceProduct = await ServiceProduct.findOne({
      _id: id,
      isAdminApproved: true,
      submissionStatus: 'published',
      vendorListingEnabled: true,
      adminListingEnabled: true,
    }).select('stock availabilitySchedule status');

    if (!serviceProduct) {
      return res.status(404).json({ message: 'Service not available.' });
    }

    const capacity = Math.max(1, Number(serviceProduct.stock || 1));
    const bookings = await ServiceBooking.aggregate([
      {
        $match: {
          serviceProduct: serviceProduct._id,
          bookingDate,
          status: { $ne: 'cancelled' },
          paymentStatus: { $ne: 'failed' },
        },
      },
      {
        $group: {
          _id: {
            from: '$timeSlot.from',
            to: '$timeSlot.to',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const bookedSlots = (bookings || []).map((row) => ({
      from: row?._id?.from || '',
      to: row?._id?.to || '',
      count: Number(row?.count || 0),
      full: Number(row?.count || 0) >= capacity,
    }));

    return res.json({
      capacity,
      bookedSlots,
      unavailable:
        String(serviceProduct.status || '').toLowerCase() === 'out of stock',
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllServiceBookings = async (req, res) => {
  try {
    const bookings = await bookingPopulateQuery(
      ServiceBooking.find({}).sort({ createdAt: -1 }),
    );
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateAdminServiceBookingStatus = async (req, res) => {
  try {
    const booking = await ServiceBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const allowed = [
      'pending',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
    ];
    const status = String(req.body?.status || '');
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Valid status is required.' });
    }
    booking.status = status;
    if (status === 'completed') booking.completedAt = new Date();
    if (status === 'cancelled') {
      booking.cancelledBy = 'admin';
      booking.cancelledAt = new Date();
    }
    await booking.save();
    const populated = await bookingPopulateQuery(
      ServiceBooking.findById(booking._id),
    );
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getVendorServiceBookings = async (req, res) => {
  try {
    const bookings = await bookingPopulateQuery(
      ServiceBooking.find({ vendor: req.vendor._id }).sort({ createdAt: -1 }),
    );
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateVendorServiceBookingStatus = async (req, res) => {
  try {
    const booking = await ServiceBooking.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const allowed = ['confirmed', 'in_progress', 'completed', 'cancelled'];
    const status = String(req.body?.status || '');
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Valid status is required.' });
    }
    booking.status = status;
    if (status === 'completed') booking.completedAt = new Date();
    if (status === 'cancelled') {
      booking.cancelledBy = 'vendor';
      booking.cancelledAt = new Date();
    }
    await booking.save();
    const populated = await bookingPopulateQuery(
      ServiceBooking.findById(booking._id),
    );
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const rescheduleServiceBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingDate, timeSlot, isUrgent, totalAmount } = req.body;

    const booking = await ServiceBooking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // ❌ prevent reschedule if completed/cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        message: 'Cannot reschedule completed or cancelled booking',
      });
    }
    // booking.bookingDate = bookingDate;
    // booking.timeSlot = timeSlot;
    // booking.isUrgent = isUrgent ?? booking.isUrgent;
    // booking.urgentFee = booking.isUrgent ? 150 : 0;
    // booking.totalAmount = booking.baseAmount + booking.urgentFee;

    // booking.status = 'confirmed'; // optional: reset status
    // booking.updatedAt = new Date();
    booking.bookingDate = bookingDate;
    booking.timeSlot = timeSlot;
    booking.isUrgent = isUrgent ?? booking.isUrgent;
    booking.urgentFee = booking.isUrgent ? 150 : 0;
    booking.totalAmount = booking.baseAmount + booking.urgentFee;

    // Rescheduling requires the vendor to re-confirm the new slot —
    // reset to 'pending' instead of auto-confirming.
    booking.status = 'pending';
    booking.updatedAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: booking,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const payMyServiceBooking = async (req, res) => {
  try {
    const booking = await ServiceBooking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This booking is already paid.' });
    }
    // if (
    //   !['pending', 'confirmed', 'in_progress'].includes(String(booking.status))
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: 'This booking can no longer be paid online.' });
    // }
    if (
      !['pending', 'confirmed', 'in_progress', 'completed'].includes(
        String(booking.status),
      )
    ) {
      return res
        .status(400)
        .json({ message: 'This booking can no longer be paid online.' });
    }

    const { paymentMethod } = req.body || {};
    booking.paymentStatus = 'paid';
    booking.paymentMethod = String(paymentMethod || 'card').trim() || 'card';
    await booking.save();

    const populated = await bookingPopulateQuery(
      ServiceBooking.findById(booking._id),
    );
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
