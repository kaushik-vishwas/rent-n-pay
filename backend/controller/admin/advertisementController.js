import Advertisement from '../../models/Advertisement.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';

// Get all advertisements (Admin)
export const getAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      advertisements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active advertisements (User)
export const getActiveAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      advertisements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Advertisement
export const createAdvertisement = async (req, res) => {
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
      'advertisements',
    );

    const advertisement = await Advertisement.create({
      title,
      subtitle,
      clickableUrl,
      image: uploadResult.secure_url,
      isActive: isActive === 'true' || isActive === true,
    });

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully.',
      advertisement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Advertisement
export const updateAdvertisement = async (req, res) => {
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
        'advertisements',
      );

      updateData.image = uploadResult.secure_url;
    }

    const advertisement = await Advertisement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Advertisement updated successfully.',
      advertisement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Advertisement
export const deleteAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndDelete(req.params.id);

    if (!advertisement) {
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

// Toggle Advertisement Status
export const toggleAdvertisementStatus = async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found.',
      });
    }

    advertisement.isActive = !advertisement.isActive;

    await advertisement.save();

    res.status(200).json({
      success: true,
      message: 'Advertisement status updated successfully.',
      advertisement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
