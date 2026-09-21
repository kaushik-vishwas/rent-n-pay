import ServiceAdvertisement from '../../models/ServiceAdvertisement.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';

// Get all service advertisements (Admin)
export const getServiceAdvertisements = async (req, res) => {
  try {
    const serviceAdvertisements = await ServiceAdvertisement.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      serviceAdvertisements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active service advertisements (User)
export const getActiveServiceAdvertisements = async (req, res) => {
  try {
    const serviceAdvertisements = await ServiceAdvertisement.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      serviceAdvertisements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Service Advertisement
export const createServiceAdvertisement = async (req, res) => {
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
      'service-advertisements',
    );

    const serviceAdvertisement = await ServiceAdvertisement.create({
      title,
      subtitle,
      clickableUrl,
      image: uploadResult.secure_url,
      isActive: isActive === 'true' || isActive === true,
    });

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully.',
      serviceAdvertisement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Service Advertisement
export const updateServiceAdvertisement = async (req, res) => {
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
        'service-advertisements',
      );

      updateData.image = uploadResult.secure_url;
    }

    const serviceAdvertisement = await ServiceAdvertisement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!serviceAdvertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Advertisement updated successfully.',
      serviceAdvertisement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Service Advertisement
export const deleteServiceAdvertisement = async (req, res) => {
  try {
    const serviceAdvertisement = await ServiceAdvertisement.findByIdAndDelete(
      req.params.id,
    );

    if (!serviceAdvertisement) {
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

// Toggle Service Advertisement Status
export const toggleServiceAdvertisementStatus = async (req, res) => {
  try {
    const serviceAdvertisement = await ServiceAdvertisement.findById(
      req.params.id,
    );

    if (!serviceAdvertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found.',
      });
    }

    serviceAdvertisement.isActive = !serviceAdvertisement.isActive;

    await serviceAdvertisement.save();

    res.status(200).json({
      success: true,
      message: 'Advertisement status updated successfully.',
      serviceAdvertisement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
