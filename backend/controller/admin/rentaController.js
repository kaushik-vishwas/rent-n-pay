import RentaBanner from '../../models/Renta.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';

// Get all rentas banners (Admin)
export const getRentaBanners = async (req, res) => {
  try {
    const banners = await RentaBanner.find().sort({ createdAt: -1 });

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

// Get active rentas banners (User)
export const getActiveRentaBanners = async (req, res) => {
  try {
    const banners = await RentaBanner.find({ isActive: true }).sort({
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

// Create Renta Banner
export const createRentaBanner = async (req, res) => {
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
      'rentas-banners',
    );

    const banner = await RentaBanner.create({
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

// Update Renta Banner
export const updateRentaBanner = async (req, res) => {
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
        'rentas-banners',
      );

      updateData.image = uploadResult.secure_url;
    }

    const banner = await RentaBanner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

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

// Delete Renta Banner
export const deleteRentaBanner = async (req, res) => {
  try {
    const banner = await RentaBanner.findByIdAndDelete(req.params.id);

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

// Toggle Renta Banner Status
export const toggleRentaBannerStatus = async (req, res) => {
  try {
    const banner = await RentaBanner.findById(req.params.id);

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
