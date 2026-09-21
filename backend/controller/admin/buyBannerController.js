import BuyBanner from '../../models/BuyBanner.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';

// Get all buy banners (Admin)
export const getBuyBanners = async (req, res) => {
  try {
    const buyBanners = await BuyBanner.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      buyBanners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active buy banners (User)
export const getActiveBuyBanners = async (req, res) => {
  try {
    const buyBanners = await BuyBanner.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      buyBanners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Buy Banner
export const createBuyBanner = async (req, res) => {
  try {
    const { title, subtitle, clickableUrl, isActive } = req.body;

    const imageFile = req.files?.image?.[0];

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: 'Buy banner image is required.',
      });
    }

    const uploadResult = await uploadImageToCloudinary(
      imageFile.buffer,
      'buyBanners',
    );

    const buyBanner = await BuyBanner.create({
      title,
      subtitle,
      clickableUrl,
      image: uploadResult.secure_url,
      isActive: isActive === 'true' || isActive === true,
    });

    res.status(201).json({
      success: true,
      message: 'Buy banner created successfully.',
      buyBanner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Buy Banner
export const updateBuyBanner = async (req, res) => {
  try {
    const { title, subtitle, clickableUrl, isActive } = req.body;

    const updateData = {
      title,
      subtitle,
      clickableUrl,
      isActive: isActive === 'true' || isActive === true,
    };

    const imageFile = req.files?.image?.[0];

    if (imageFile) {
      const uploadResult = await uploadImageToCloudinary(
        imageFile.buffer,
        'buyBanners',
      );

      updateData.image = uploadResult.secure_url;
    }

    const buyBanner = await BuyBanner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!buyBanner) {
      return res.status(404).json({
        success: false,
        message: 'Buy banner not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Buy banner updated successfully.',
      buyBanner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Buy Banner
export const deleteBuyBanner = async (req, res) => {
  try {
    const buyBanner = await BuyBanner.findByIdAndDelete(req.params.id);

    if (!buyBanner) {
      return res.status(404).json({
        success: false,
        message: 'Buy banner not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Buy banner deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle Buy Banner Status
export const toggleBuyBannerStatus = async (req, res) => {
  try {
    const buyBanner = await BuyBanner.findById(req.params.id);

    if (!buyBanner) {
      return res.status(404).json({
        success: false,
        message: 'Buy banner not found.',
      });
    }

    buyBanner.isActive = !buyBanner.isActive;

    await buyBanner.save();

    res.status(200).json({
      success: true,
      message: 'Buy banner status updated successfully.',
      buyBanner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
