import express from 'express';
import { userAuth } from '../middleware/userAuth.js';
import {
  addReview,
  getMyReview,
  getRentProductReviews,
} from '../controller/user/reviewController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/my/:productId/:orderId', userAuth, getMyReview);
router.post('/:productId', userAuth, upload.array('images', 5), addReview);
router.get('/rent-product/:productId', getRentProductReviews);

export default router;
