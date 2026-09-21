import RentBanner from '../../models/RentBanner.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';

// Get all rent banners (Admin)
export const getRentBanners = async (req, res) => {
  try {
    const rentBanners = await RentBanner.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      rentBanners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active rent banners (User)
export const getActiveRentBanners = async (req, res) => {
  try {
    const rentBanners = await RentBanner.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      rentBanners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Rent Banner
export const createRentBanner = async (req, res) => {
  try {
    const { title, subtitle, clickableUrl, isActive } = req.body;

    const imageFile = req.files?.image?.[0];

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: 'Rent banner image is required.',
      });
    }

    const uploadResult = await uploadImageToCloudinary(
      imageFile.buffer,
      'rentBanners',
    );

    const rentBanner = await RentBanner.create({
      title,
      subtitle,
      clickableUrl,
      image: uploadResult.secure_url,
      isActive: isActive === 'true' || isActive === true,
    });

    res.status(201).json({
      success: true,
      message: 'Rent banner created successfully.',
      rentBanner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Rent Banner
export const updateRentBanner = async (req, res) => {
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
        'rentBanners',
      );

      updateData.image = uploadResult.secure_url;
    }

    const rentBanner = await RentBanner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!rentBanner) {
      return res.status(404).json({
        success: false,
        message: 'Rent banner not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rent banner updated successfully.',
      rentBanner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Rent Banner
export const deleteRentBanner = async (req, res) => {
  try {
    const rentBanner = await RentBanner.findByIdAndDelete(req.params.id);

    if (!rentBanner) {
      return res.status(404).json({
        success: false,
        message: 'Rent banner not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rent banner deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle Rent Banner Status
export const toggleRentBannerStatus = async (req, res) => {
  try {
    const rentBanner = await RentBanner.findById(req.params.id);

    if (!rentBanner) {
      return res.status(404).json({
        success: false,
        message: 'Rent banner not found.',
      });
    }

    rentBanner.isActive = !rentBanner.isActive;

    await rentBanner.save();

    res.status(200).json({
      success: true,
      message: 'Rent banner status updated successfully.',
      rentBanner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
