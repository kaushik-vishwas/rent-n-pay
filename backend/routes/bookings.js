import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import { userAuth } from '../middleware/userAuth.js';
import {
  cancelMyServiceBooking,
  createServiceBooking,
  getAllServiceBookings,
  getMyServiceBookingById,
  getMyServiceBookings,
  updateAdminServiceBookingStatus,
  rescheduleServiceBooking,
  payMyServiceBooking,
} from '../controller/serviceBookingController.js';

const router = express.Router();

router.post('/', userAuth, createServiceBooking);
router.get('/my', userAuth, getMyServiceBookings);
router.get('/my/:id', userAuth, getMyServiceBookingById);
router.put('/my/:id/cancel', userAuth, cancelMyServiceBooking);
router.put('/my/:id/pay', userAuth, payMyServiceBooking);

router.get('/', adminAuth, getAllServiceBookings);
router.put('/:id/status', adminAuth, updateAdminServiceBookingStatus);
router.patch('/:id/reschedule', userAuth, rescheduleServiceBooking);

export default router;
