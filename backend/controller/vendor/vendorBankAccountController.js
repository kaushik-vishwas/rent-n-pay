import VendorBankAccount from '../../models/VendorBankAccount.js';
import VendorKyc from '../../models/VendorKyc.js';
import { uploadMediaToCloudinary } from '../../config/cloudinaryUpload.js';

const uploadFileIfExists = async (file, folder) => {
  if (!file) return null;
  // const result = await uploadImageToCloudinary(file.buffer, folder);
  const result = await uploadMediaToCloudinary(file.buffer, folder);
  return result?.secure_url || '';
};

const getUploadedFile = (req, fieldName) => {
  if (req?.files && !Array.isArray(req.files)) {
    return req.files?.[fieldName]?.[0] || null;
  }
  if (Array.isArray(req?.files)) {
    return req.files.find((f) => f?.fieldname === fieldName) || null;
  }
  // upload.single(...) shape
  if (req?.file && req.file.fieldname === fieldName) {
    return req.file;
  }
  return null;
};

export const listMyBankAccounts = async (req, res) => {
  const accounts = await VendorBankAccount.find({
    vendorId: req.vendor._id,
  }).sort({ createdAt: -1 });
  res.json({ success: true, accounts });
};

export const addMyBankAccount = async (req, res) => {
  const {
    accountHolderName,
    accountNumber,
    confirmAccountNumber,
    ifscCode,
    isDefault,
  } = req.body;
  if (accountNumber !== confirmAccountNumber) {
    return res
      .status(400)
      .json({ success: false, message: 'Account numbers do not match' });
  }
  const cancelledCheque = await uploadFileIfExists(
    getUploadedFile(req, 'cancelledCheque'),
    'vendor-bank-accounts',
  );
  if (isDefault === 'true' || isDefault === true) {
    await VendorBankAccount.updateMany(
      { vendorId: req.vendor._id },
      { isDefault: false },
    );
    await VendorKyc.updateOne(
      { vendorId: req.vendor._id },
      { 'bankDetails.isDefault': false },
    );
  }
  //   const account = await VendorBankAccount.create({
  //     vendorId: req.vendor._id,
  //     accountHolderName,
  //     accountNumber,
  //     confirmAccountNumber,
  //     ifscCode,
  //     cancelledCheque,
  //     isDefault: isDefault === 'true' || isDefault === true,
  //   });
  //   res.json({ success: true, account });
  // };

  const makingDefault = isDefault === 'true' || isDefault === true;
  const account = await VendorBankAccount.create({
    vendorId: req.vendor._id,
    accountHolderName,
    accountNumber,
    confirmAccountNumber,
    ifscCode,
    cancelledCheque,
    isDefault: makingDefault,
    // A new default submission always needs fresh admin review.
    status: makingDefault ? 'Pending' : 'Pending',
    rejectionReason: '',
  });
  res.json({ success: true, account });
};

export const updateMyBankAccount = async (req, res) => {
  const { id } = req.params;
  const account = await VendorBankAccount.findOne({
    _id: id,
    vendorId: req.vendor._id,
  });
  if (!account)
    return res
      .status(404)
      .json({ success: false, message: 'Bank account not found' });

  const {
    accountHolderName,
    accountNumber,
    confirmAccountNumber,
    ifscCode,
    isDefault,
  } = req.body;
  if (
    accountNumber &&
    confirmAccountNumber &&
    accountNumber !== confirmAccountNumber
  ) {
    return res
      .status(400)
      .json({ success: false, message: 'Account numbers do not match' });
  }
  const updatedChequeUrl = await uploadFileIfExists(
    getUploadedFile(req, 'cancelledCheque'),
    'vendor-bank-accounts',
  );
  if (updatedChequeUrl) account.cancelledCheque = updatedChequeUrl;
  account.accountHolderName = accountHolderName ?? account.accountHolderName;
  account.accountNumber = accountNumber ?? account.accountNumber;
  account.confirmAccountNumber =
    confirmAccountNumber ?? account.confirmAccountNumber;
  account.ifscCode = ifscCode ?? account.ifscCode;
  //   if (isDefault === 'true' || isDefault === true) {
  //     await VendorBankAccount.updateMany(
  //       { vendorId: req.vendor._id },
  //       { isDefault: false },
  //     );
  //     await VendorKyc.updateOne(
  //       { vendorId: req.vendor._id },
  //       { 'bankDetails.isDefault': false },
  //     );
  //     account.isDefault = true;
  //   }
  //   await account.save();
  //   res.json({ success: true, account });
  // };

  if (isDefault === 'true' || isDefault === true) {
    await VendorBankAccount.updateMany(
      { vendorId: req.vendor._id },
      { isDefault: false },
    );
    await VendorKyc.updateOne(
      { vendorId: req.vendor._id },
      { 'bankDetails.isDefault': false },
    );
    account.isDefault = true;
    // Becoming the default requires fresh admin review, even if this
    // exact account was verified/rejected before.
    account.status = 'Pending';
    account.rejectionReason = '';
    account.verified = false;
  }
  await account.save();
  res.json({ success: true, account });
};

export const deleteMyBankAccount = async (req, res) => {
  const { id } = req.params;
  await VendorBankAccount.deleteOne({ _id: id, vendorId: req.vendor._id });
  res.json({ success: true });
};

// export const getMyDefaultBankAccount = async (req, res) => {
//   try {
//     const defaultAccount = await VendorBankAccount.findOne({
//       vendorId: req.vendor._id,
//       isDefault: true,
//     }).lean();

//     if (defaultAccount) {
//       return res.json({
//         success: true,
//         bankDetails: {
//           accountHolderName: defaultAccount.accountHolderName,
//           accountNumber: defaultAccount.accountNumber,
//           ifscCode: defaultAccount.ifscCode,
//           source: 'bankAccount',
//         },
//       });
//     }

//     const kyc = await VendorKyc.findOne({ vendorId: req.vendor._id }).lean();
//     if (kyc?.bankDetails?.isDefault && kyc.bankDetails?.accountNumber) {
//       return res.json({
//         success: true,
//         bankDetails: {
//           accountHolderName: kyc.bankDetails.accountHolderName,
//           accountNumber: kyc.bankDetails.accountNumber,
//           ifscCode: kyc.bankDetails.ifscCode,
//           source: 'kyc',
//         },
//       });
//     }

//     return res.json({ success: true, bankDetails: null });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getMyDefaultBankAccount = async (req, res) => {
//   try {
//     const defaultAccount = await VendorBankAccount.findOne({
//       vendorId: req.vendor._id,
//       isDefault: true,
//     }).lean();

//     if (defaultAccount) {
//       return res.json({
//         success: true,
//         bankDetails: {
//           accountHolderName: defaultAccount.accountHolderName,
//           accountNumber: defaultAccount.accountNumber,
//           ifscCode: defaultAccount.ifscCode,
//           status: defaultAccount.status || 'Pending',
//           rejectionReason: defaultAccount.rejectionReason || '',
//           source: 'bankAccount',
//         },
//       });
//     }

//     const kyc = await VendorKyc.findOne({ vendorId: req.vendor._id }).lean();
//     if (kyc?.bankDetails?.isDefault && kyc.bankDetails?.accountNumber) {
//       return res.json({
//         success: true,
//         bankDetails: {
//           accountHolderName: kyc.bankDetails.accountHolderName,
//           accountNumber: kyc.bankDetails.accountNumber,
//           ifscCode: kyc.bankDetails.ifscCode,
//           status: kyc.bankDetails.status || 'Pending',
//           rejectionReason: kyc.bankDetails.rejectionReason || '',
//           source: 'kyc',
//         },
//       });
//     }

//     return res.json({ success: true, bankDetails: null });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getMyDefaultBankAccount = async (req, res) => {
  try {
    let defaultAccount = await VendorBankAccount.findOne({
      vendorId: req.vendor._id,
      isDefault: true,
    }).lean();

    if (!defaultAccount) {
      const kycForFallback = await VendorKyc.findOne({
        vendorId: req.vendor._id,
      })
        .select('bankDetails')
        .lean();
      const hasKycBank = Boolean(kycForFallback?.bankDetails?.accountNumber);

      if (!hasKycBank) {
        const allAccounts = await VendorBankAccount.find({
          vendorId: req.vendor._id,
          isActive: true,
        }).lean();
        if (allAccounts.length === 1) {
          defaultAccount = allAccounts[0];
        }
      }
    }

    if (defaultAccount) {
      return res.json({
        success: true,
        bankDetails: {
          accountHolderName: defaultAccount.accountHolderName,
          accountNumber: defaultAccount.accountNumber,
          ifscCode: defaultAccount.ifscCode,
          status: defaultAccount.status || 'Pending',
          rejectionReason: defaultAccount.rejectionReason || '',
          source: 'bankAccount',
        },
      });
    }

    // 3. Try explicitly marked default in KYC bank
    // const kyc = await VendorKyc.findOne({ vendorId: req.vendor._id }).lean();
    // if (kyc?.bankDetails?.accountNumber) {
    //   const kycIsDefault =
    //     kyc.bankDetails.isDefault ||
    //     (await VendorBankAccount.countDocuments({
    //       vendorId: req.vendor._id,
    //       isActive: true,
    //     })) === 0;

    //   if (kycIsDefault) {
    //     return res.json({
    //       success: true,
    //       bankDetails: {
    //         accountHolderName: kyc.bankDetails.accountHolderName,
    //         accountNumber: kyc.bankDetails.accountNumber,
    //         ifscCode: kyc.bankDetails.ifscCode,
    //         status: kyc.bankDetails.status || 'Pending',
    //         rejectionReason: kyc.bankDetails.rejectionReason || '',
    //         source: 'kyc',
    //       },
    //     });
    //   }
    // }

    // 3. Try explicitly marked default in KYC bank
    const kyc = await VendorKyc.findOne({ vendorId: req.vendor._id }).lean();
    if (kyc?.bankDetails?.accountNumber) {
      // KYC bank stays the default as long as no VendorBankAccount has ever
      // been explicitly marked default — not just when zero accounts exist.
      // (We already confirmed above that no VendorBankAccount matched
      // isDefault: true, so simply having OTHER, non-default accounts
      // around must not knock the KYC bank out of default status.)
      const kycIsDefault = true;

      if (kycIsDefault) {
        // This bank account was submitted as part of KYC, so once admin
        // approves the vendor's overall KYC, treat this account as already
        // verified too — no separate admin bank-verification step needed.
        const effectiveStatus =
          kyc.status === 'approved'
            ? 'Verified'
            : kyc.bankDetails.status || 'Pending';

        return res.json({
          success: true,
          bankDetails: {
            accountHolderName: kyc.bankDetails.accountHolderName,
            accountNumber: kyc.bankDetails.accountNumber,
            ifscCode: kyc.bankDetails.ifscCode,
            status: effectiveStatus,
            rejectionReason: kyc.bankDetails.rejectionReason || '',
            source: 'kyc',
          },
        });
      }
    }

    return res.json({ success: true, bankDetails: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
