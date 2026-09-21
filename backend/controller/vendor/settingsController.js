import VendorKyc from '../../models/VendorKyc.js';
import Vendor from '../../models/vendorAuthModel.js';

const maskTail = (val, visible = 4) => {
  if (!val || typeof val !== 'string') return '';
  if (val.length <= visible) return '•'.repeat(val.length);
  return '•'.repeat(val.length - visible) + val.slice(-visible);
};

export const getMyKycSettings = async (req, res) => {
  try {
    const kyc = await VendorKyc.findOne({ vendorId: req.vendor._id }).lean();

    if (!kyc) {
      return res.json({ kyc: null });
    }

    const sanitized = {
      status: kyc.status,
      rejectionReason: kyc.rejectionReason || '',
      adminComment: kyc.adminComment || '',
      sectionsCompleted: kyc.sectionsCompleted || {},
      currentStep: kyc.currentStep,
      applicationSubmitted: kyc.applicationSubmitted,

      personal: {
        fullName: kyc.fullName,
        dateOfBirth: kyc.dateOfBirth,
        permanentAddress: kyc.permanentAddress,
        contactNumber: kyc.contactNumber,
        ownerPhoto: kyc.ownerPhoto,
        panNumber: maskTail(kyc.panNumber),
        aadhaarNumber: maskTail(kyc.aadhaarNumber, 4),
        panPhoto: kyc.panPhoto,
        aadhaarFront: kyc.aadhaarFront,
        aadhaarBack: kyc.aadhaarBack,
        tshirtSize: kyc.tshirtSize,
        jeansWaistSize: kyc.jeansWaistSize,
        shoeSize: kyc.shoeSize,
      },

      business: {
        shopName: kyc.businessDetails?.shopName || '',
        businessCategory: kyc.businessDetails?.businessCategory || '',
        shopActNumber: kyc.businessDetails?.shopActNumber || '',
        gstin: kyc.businessDetails?.gstin || '',
        primaryContactNumber: kyc.businessDetails?.primaryContactNumber || '',
        secondaryContactNumber:
          kyc.businessDetails?.secondaryContactNumber || '',
        shopActLicense: kyc.businessDetails?.shopActLicense || '',
        shopActLicenseFileName:
          kyc.businessDetails?.shopActLicenseFileName || '',
        gstCertificate: kyc.businessDetails?.gstCertificate || '',
        gstCertificateFileName:
          kyc.businessDetails?.gstCertificateFileName || '',
      },

      bank: {
        accountHolderName: kyc.bankDetails?.accountHolderName || '',
        accountNumber: kyc.bankDetails?.accountNumber || '',
        ifscCode: kyc.bankDetails?.ifscCode || '',
        cancelledCheque: kyc.bankDetails?.cancelledCheque || '',
        isDefault: kyc.bankDetails?.isDefault || false,
        // confirmAccountNumber intentionally excluded — write-only field, no reason to echo it back
      },

      stores: (kyc.storeManagement?.stores || []).map((store) => ({
        _id: store._id,
        storeName: store.storeName,
        completeAddress: store.completeAddress,
        pincode: store.pincode,
        mapLocation: store.mapLocation,
        mapAddress: store.mapAddress,
        mapLat: store.mapLat,
        mapLng: store.mapLng,
        shopFrontPhotoUrl: store.shopFrontPhotoUrl,
        additionalPhotoUrls: store.additionalPhotoUrls,
        deliveryZoneType: store.deliveryZoneType,
        serviceRadiusKm: store.serviceRadiusKm,
        serviceModeLocalDelivery: store.serviceModeLocalDelivery,
        serviceModePanIndia: store.serviceModePanIndia,
        walkInAccessLabel: store.walkInAccessLabel,
        isDefault: store.isDefault,
        isActive: store.isActive,
        allowsWalkIn: store.allowsWalkIn,
        storeTimings: store.storeTimings,
        // disabledAt / disabledBy excluded — admin-only audit fields
      })),

      slaAccepted: kyc.storeManagement?.slaAccepted || false,
      commissionAccepted: kyc.storeManagement?.commissionAccepted || false,
    };

    res.json({ kyc: sanitized });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id).lean();

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const maskTail = (val, visible = 4) => {
      if (!val) return '';
      if (val.length <= visible) return '•'.repeat(val.length);
      return '•'.repeat(val.length - visible) + val.slice(-visible);
    };

    res.json({
      vendor: {
        _id: vendor._id,
        fullName: vendor.fullName,
        emailAddress: vendor.emailAddress,
        mobileNumber: vendor.mobileNumber,
        referralCode: vendor.referralCode,
        isVerified: vendor.isVerified,
        bankDetails: {
          accountHolderName: vendor.bankDetails?.accountHolderName || '',
          accountNumber: maskTail(vendor.bankDetails?.accountNumber),
          ifscCode: vendor.bankDetails?.ifscCode || '',
          bankName: vendor.bankDetails?.bankName || '',
          verified: vendor.bankDetails?.verified || false,
          status: vendor.bankDetails?.status || 'Not Added',
          rejectionReason: vendor.bankDetails?.rejectionReason || '',
          chequeImage: vendor.bankDetails?.chequeImage || '',
          // reviewedBy excluded — internal/admin field
        },
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
