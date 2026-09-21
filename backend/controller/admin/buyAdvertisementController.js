import BuyAdvertisement from '../../models/BuyAdvertisement.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';

// Get all buy advertisements (Admin)
export const getBuyAdvertisements = async (req, res) => {
  try {
    const buyAdvertisements = await BuyAdvertisement.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      buyAdvertisements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active buy advertisements (User)
export const getActiveBuyAdvertisements = async (req, res) => {
  try {
    const buyAdvertisements = await BuyAdvertisement.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      buyAdvertisements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Buy Advertisement
export const createBuyAdvertisement = async (req, res) => {
  try {
    const { title, subtitle, clickableUrl, isActive } = req.body;

    const imageFile = req.files?.image?.[0];

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: 'Advertisement image is required.',
      });
    }

    const uploadResult = await uploadImageToCloudinary(
      imageFile.buffer,
      'buy-advertisements',
    );

    const buyAdvertisement = await BuyAdvertisement.create({
      title,
      subtitle,
      clickableUrl,
      image: uploadResult.secure_url,
      isActive: isActive === 'true' || isActive === true,
    });

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully.',
      buyAdvertisement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Buy Advertisement
export const updateBuyAdvertisement = async (req, res) => {
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
        'buy-advertisements',
      );

      updateData.image = uploadResult.secure_url;
    }

    const buyAdvertisement = await BuyAdvertisement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!buyAdvertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Advertisement updated successfully.',
      buyAdvertisement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Buy Advertisement
export const deleteBuyAdvertisement = async (req, res) => {
  try {
    const buyAdvertisement = await BuyAdvertisement.findByIdAndDelete(
      req.params.id,
    );

    if (!buyAdvertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Advertisement deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle Buy Advertisement Status
export const toggleBuyAdvertisementStatus = async (req, res) => {
  try {
    const buyAdvertisement = await BuyAdvertisement.findById(req.params.id);

    if (!buyAdvertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found.',
      });
    }

    buyAdvertisement.isActive = !buyAdvertisement.isActive;

    await buyAdvertisement.save();

    res.status(200).json({
      success: true,
      message: 'Advertisement status updated successfully.',
      buyAdvertisement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
