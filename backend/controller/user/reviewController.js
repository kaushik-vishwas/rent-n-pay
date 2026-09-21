import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import { uploadMediaToCloudinary } from '../../config/cloudinaryUpload.js';

export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { orderId, rating, comment, keepImages } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const targetLine = order.products.find(
      (item) =>
        String(item.product) === String(productId) &&
        item.productType === 'Sell' &&
        item.lineStatus === 'delivered',
    );
    if (!targetLine) {
      return res.status(400).json({
        message: 'Only delivered sell products can be reviewed',
      });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // upload new images
    const files = Array.isArray(req.files) ? req.files.slice(0, 5) : [];
    const newImageUrls = [];
    for (const file of files) {
      const result = await uploadMediaToCloudinary(
        file.buffer,
        'product-reviews',
      );
      if (result?.secure_url) newImageUrls.push(String(result.secure_url));
    }

    // parse which old images the user wants to keep
    let keptOldUrls = [];
    try {
      const parsed = JSON.parse(keepImages || '[]');
      keptOldUrls = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      keptOldUrls = [];
    }

    // final image list = kept old URLs + newly uploaded URLs (max 5)
    const finalImages = [...keptOldUrls, ...newImageUrls].slice(0, 5);

    const existingReview = product.reviews.find(
      (r) => String(r.user) === String(userId),
    );

    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
      existingReview.orderId = orderId;
      existingReview.images = finalImages; // always update images
      existingReview.updatedAt = new Date();
    } else {
      product.reviews.push({
        user: userId,
        name: req.user.fullName,
        rating: Number(rating),
        comment,
        images: finalImages,
        orderId,
      });
    }

    product.numReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: existingReview
        ? 'Review updated successfully'
        : 'Review added successfully',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
export const getMyReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ exists: false });
    }

    const review = product.reviews.find(
      (r) => String(r.user) === String(userId),
    );

    if (!review) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        images: review.images || [],
        orderId: review.orderId,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getRentProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const orders = await Order.find({
      'products.product': productId,
      'products.returnRequest.status': 'review_submitted',
    })
      .populate('user', 'fullName')
      .lean();

    const reviews = [];

    for (const order of orders) {
      for (const line of order.products || []) {
        if (String(line.product) !== String(productId)) continue;
        const rr = line.returnRequest;
        if (!rr || rr.status !== 'review_submitted') continue;
        if (!rr.rating) continue;

        reviews.push({
          _id: line._id,
          name: order.user?.fullName || 'Customer',
          rating: rr.rating,
          comment: rr.reviewText || '',
          images: (rr.media || []).map((m) => m.url).filter(Boolean),
          createdAt: rr.reviewedAt || rr.requestedAt || order.createdAt,
          orderId: order._id,
        });
      }
    }

    const numReviews = reviews.length;
    const averageRating =
      numReviews > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews
        : 0;

    res.json({
      success: true,
      reviews,
      numReviews,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
