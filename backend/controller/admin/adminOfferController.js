import AdminOffer from '../../models/AdminOffer.js';
import Product from '../../models/Product.js';
import { getCityProductIds } from '../../utils/cityScope.js';

// export const getAdminOffers = async (req, res) => {
//   try {
//     const offers = await AdminOffer.find()
//       .populate(
//         'productId',
//         'productName image price stock type status vendorId',
//       )
//       .sort({ updatedAt: -1 });
//     res.json({ offers });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getAdminOffers = async (req, res) => {
  try {
    const cityProductIds = await getCityProductIds(req);
    const offerFilter = cityProductIds
      ? { productId: { $in: cityProductIds } }
      : {};

    const offers = await AdminOffer.find(offerFilter)
      .populate(
        'productId',
        'productName image price stock type status vendorId',
      )
      .sort({ updatedAt: -1 });
    res.json({ offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upsertAdminOffer = async (req, res) => {
  try {
    const {
      productId,
      platformFeeReductionPercent,
      isActive = true,
    } = req.body;
    if (!productId || platformFeeReductionPercent == null) {
      return res.status(400).json({
        message: 'productId and platformFeeReductionPercent are required',
      });
    }
    const reduction = Number(platformFeeReductionPercent);
    if (!Number.isFinite(reduction) || reduction < 1 || reduction > 100) {
      return res.status(400).json({
        message: 'platformFeeReductionPercent must be between 1 and 100',
      });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const offer = await AdminOffer.findOneAndUpdate(
      { productId },
      { platformFeeReductionPercent: reduction, isActive: Boolean(isActive) },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).populate(
      'productId',
      'productName image price stock type status vendorId',
    );

    res.status(200).json({ message: 'Admin offer saved', offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAdminOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await AdminOffer.findByIdAndDelete(id);
    if (!offer)
      return res.status(404).json({ message: 'Admin offer not found' });
    res.json({ message: 'Admin offer deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Called by vendor order modal to get platform fee for a product
export const getAdminOfferByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const offer = await AdminOffer.findOne({ productId, isActive: true });
    if (!offer) return res.json({ offer: null });
    res.json({ offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
