import Banner from '../../models/Banner.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';

// Get all banners (Admin)
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active banners (User)
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Banner
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, clickableUrl, isActive } = req.body;

    const imageFile = req.files?.image?.[0];

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: 'Banner image is required.',
      });
    }

    const uploadResult = await uploadImageToCloudinary(
      imageFile.buffer,
      'banners',
    );

    const banner = await Banner.create({
      title,
      subtitle,
      clickableUrl,
      image: uploadResult.secure_url,
      isActive: isActive === 'true' || isActive === true,
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully.',
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Banner
export const updateBanner = async (req, res) => {
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
        'banners',
      );

      updateData.image = uploadResult.secure_url;
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully.',
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle Banner Status
export const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found.',
      });
    }

    banner.isActive = !banner.isActive;

    await banner.save();

    res.status(200).json({
      success: true,
      message: 'Banner status updated successfully.',
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
