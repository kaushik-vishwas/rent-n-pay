import RentOffer from '../../models/RentOffer.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';

// Get all rent offers (Admin)
export const getRentOffers = async (req, res) => {
  try {
    const rentOffers = await RentOffer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      rentOffers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active rent offers (User)
export const getActiveRentOffers = async (req, res) => {
  try {
    const rentOffers = await RentOffer.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      rentOffers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Rent Offer
export const createRentOffer = async (req, res) => {
  try {
    const { title, subtitle, clickableUrl, isActive } = req.body;

    const imageFile = req.files?.image?.[0];

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: 'Rent offer image is required.',
      });
    }

    const uploadResult = await uploadImageToCloudinary(
      imageFile.buffer,
      'rentOffers',
    );

    const rentOffer = await RentOffer.create({
      title,
      subtitle,
      clickableUrl,
      image: uploadResult.secure_url,
      isActive: isActive === 'true' || isActive === true,
    });

    res.status(201).json({
      success: true,
      message: 'Rent offer created successfully.',
      rentOffer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Rent Offer
export const updateRentOffer = async (req, res) => {
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
        'rentOffers',
      );

      updateData.image = uploadResult.secure_url;
    }

    const rentOffer = await RentOffer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!rentOffer) {
      return res.status(404).json({
        success: false,
        message: 'Rent offer not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rent offer updated successfully.',
      rentOffer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Rent Offer
export const deleteRentOffer = async (req, res) => {
  try {
    const rentOffer = await RentOffer.findByIdAndDelete(req.params.id);

    if (!rentOffer) {
      return res.status(404).json({
        success: false,
        message: 'Rent offer not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rent offer deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle Rent Offer Status
export const toggleRentOfferStatus = async (req, res) => {
  try {
    const rentOffer = await RentOffer.findById(req.params.id);

    if (!rentOffer) {
      return res.status(404).json({
        success: false,
        message: 'Rent offer not found.',
      });
    }

    rentOffer.isActive = !rentOffer.isActive;

    await rentOffer.save();

    res.status(200).json({
      success: true,
      message: 'Rent offer status updated successfully.',
      rentOffer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
