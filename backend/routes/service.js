import express from 'express';
import {
  getServiceProductById,
  getServiceProducts,
  addServiceReview,
  getMyServiceReview,
  getRelatedServices,
} from '../controller/vendor/serviceProductController.js';
import { getServiceBookingAvailability } from '../controller/serviceBookingController.js';
import { userAuth } from '../middleware/userAuth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getServiceProducts);

router.get('/:id/availability', getServiceBookingAvailability);

router.get('/:id', getServiceProductById);
router.post(
  '/:id/reviews',
  userAuth,
  upload.array('images', 5),
  addServiceReview,
);
router.get('/:id/my-review', userAuth, getMyServiceReview);
router.get('/:id/related', getRelatedServices);

export default router;
