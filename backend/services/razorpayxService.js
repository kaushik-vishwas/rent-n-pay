import Razorpay from 'razorpay';
console.log('RAZORPAYX_KEY_ID present?', !!process.env.RAZORPAYX_KEY_ID);
console.log(
  'RAZORPAYX_KEY_SECRET present?',
  !!process.env.RAZORPAYX_KEY_SECRET,
);

const rzp = new Razorpay({
  key_id: process.env.RAZORPAYX_KEY_ID,
  key_secret: process.env.RAZORPAYX_KEY_SECRET,
});
// console.log('rzp.contacts exists?', !!rzp.contacts);
// console.log('rzp.contact exists?', !!rzp.contact);
// console.log('rzp.fundAccount exists?', !!rzp.fundAccount);
// console.log('rzp.payouts exists?', !!rzp.payouts);
// console.log('rzp.payout exists?', !!rzp.payout);
// console.log('All rzp keys:', Object.keys(rzp));
// Creates (or reuses) a Contact + Fund Account for a vendor, caches IDs on vendor doc
export const ensureVendorFundAccount = async (vendor) => {
  if (vendor.bankDetails?.razorpayFundAccountId) {
    return {
      contactId: vendor.bankDetails.razorpayContactId,
      fundAccountId: vendor.bankDetails.razorpayFundAccountId,
    };
  }

  // 1. Create Contact (using raw API since this SDK version lacks rzp.contacts)
  const contact = await rzp.api.post({
    url: '/contacts',
    data: {
      name: vendor.bankDetails.accountHolderName || vendor.fullName,
      email: vendor.emailAddress,
      contact: vendor.mobileNumber || undefined,
      type: 'vendor',
      reference_id: String(vendor._id),
    },
  });

  // 2. Create Fund Account (bank account) linked to that Contact
  const fundAccount = await rzp.fundAccount.create({
    contact_id: contact.id,
    account_type: 'bank_account',
    bank_account: {
      name: vendor.bankDetails.accountHolderName,
      ifsc: vendor.bankDetails.ifscCode,
      account_number: vendor.bankDetails.accountNumber,
    },
  });

  vendor.bankDetails.razorpayContactId = contact.id;
  vendor.bankDetails.razorpayFundAccountId = fundAccount.id;
  await vendor.save();

  return { contactId: contact.id, fundAccountId: fundAccount.id };
};

// Creates (or reuses) a Contact + Fund Account for a CUSTOMER refund payout.
// Mirrors ensureVendorFundAccount, but caches IDs on the order line's
// returnRequest (no persistent customer bank-details document exists).
export const ensureCustomerFundAccount = async (order, line) => {
  const rr = line.returnRequest;

  if (rr.refundRazorpayFundAccountId) {
    return {
      contactId: rr.refundRazorpayContactId,
      fundAccountId: rr.refundRazorpayFundAccountId,
    };
  }

  const contact = await rzp.api.post({
    url: '/contacts',
    data: {
      name: rr.refundDetails.bankAccountName || order.name,
      contact: order.phone || undefined,
      type: 'customer',
      reference_id: `${order._id}_${line._id}`,
    },
  });

  const fundAccount = await rzp.fundAccount.create({
    contact_id: contact.id,
    account_type: 'bank_account',
    bank_account: {
      name: rr.refundDetails.bankAccountName,
      ifsc: rr.refundDetails.bankIfsc,
      account_number: rr.refundDetails.bankAccountNumber,
    },
  });

  rr.refundRazorpayContactId = contact.id;
  rr.refundRazorpayFundAccountId = fundAccount.id;
  await order.save();

  return { contactId: contact.id, fundAccountId: fundAccount.id };
};

// Creates a Contact + Fund Account for a specific referral withdrawal,
// using the bank snapshot locked onto that withdrawal at request time —
// NOT the user's current (possibly since-edited) bankDetails. Caches the
// IDs on the withdrawal itself, not on the user, so each withdrawal is
// independently tied to the account it was authorized against.
export const ensureWithdrawalFundAccount = async (user, withdrawal) => {
  if (withdrawal.razorpayFundAccountId) {
    return {
      contactId: withdrawal.razorpayContactId,
      fundAccountId: withdrawal.razorpayFundAccountId,
    };
  }

  const snap = withdrawal.payoutBankSnapshot;

  const contact = await rzp.api.post({
    url: '/contacts',
    data: {
      name: snap.accountName || user.fullName,
      email: user.emailAddress,
      contact: user.mobileNumber || undefined,
      type: 'customer',
      reference_id: `referral_${withdrawal._id}`,
    },
  });

  const fundAccount = await rzp.fundAccount.create({
    contact_id: contact.id,
    account_type: 'bank_account',
    bank_account: {
      name: snap.accountName,
      ifsc: snap.ifscCode,
      account_number: snap.accountNumber,
    },
  });

  withdrawal.razorpayContactId = contact.id;
  withdrawal.razorpayFundAccountId = fundAccount.id;

  return { contactId: contact.id, fundAccountId: fundAccount.id };
};

// Creates (or reuses) a Contact + Fund Account for a REFERRAL withdrawal
// payout. Mirrors ensureVendorFundAccount, caching IDs on User.bankDetails
// so we only hit Razorpay's contact/fund-account APIs once per user.
export const ensureUserFundAccount = async (user) => {
  if (user.bankDetails?.razorpayFundAccountId) {
    return {
      contactId: user.bankDetails.razorpayContactId,
      fundAccountId: user.bankDetails.razorpayFundAccountId,
    };
  }

  const contact = await rzp.api.post({
    url: '/contacts',
    data: {
      name: user.bankDetails.accountName || user.fullName,
      email: user.emailAddress,
      contact: user.mobileNumber || undefined,
      type: 'customer',
      reference_id: String(user._id),
    },
  });

  const fundAccount = await rzp.fundAccount.create({
    contact_id: contact.id,
    account_type: 'bank_account',
    bank_account: {
      name: user.bankDetails.accountName,
      ifsc: user.bankDetails.ifscCode,
      account_number: user.bankDetails.accountNumber,
    },
  });

  user.bankDetails.razorpayContactId = contact.id;
  user.bankDetails.razorpayFundAccountId = fundAccount.id;
  await user.save();

  return { contactId: contact.id, fundAccountId: fundAccount.id };
};

export const ensureCustomerFundAccountForCancel = async (order, line) => {
  if (line.cancelRefundRazorpayFundAccountId) {
    return {
      contactId: line.cancelRefundRazorpayContactId,
      fundAccountId: line.cancelRefundRazorpayFundAccountId,
    };
  }

  const details = line.cancelRefundDetails || {};
  const isUpi = details.method === 'upi';

  const contact = await rzp.api.post({
    url: '/contacts',
    data: {
      name: isUpi ? order.name : details.bankAccountName || order.name,
      contact: order.phone || undefined,
      type: 'customer',
      reference_id: `cancel_${order._id}_${line._id}`,
    },
  });

  const fundAccount = await rzp.fundAccount.create(
    isUpi
      ? {
          contact_id: contact.id,
          account_type: 'vpa',
          vpa: {
            address: details.upiId,
          },
        }
      : {
          contact_id: contact.id,
          account_type: 'bank_account',
          bank_account: {
            name: details.bankAccountName,
            ifsc: details.bankIfsc,
            account_number: details.bankAccountNumber,
          },
        },
  );

  line.cancelRefundRazorpayContactId = contact.id;
  line.cancelRefundRazorpayFundAccountId = fundAccount.id;
  await order.save();

  return { contactId: contact.id, fundAccountId: fundAccount.id };
};

// Triggers an actual payout (test mode = no real money moves)
export const createPayout = async ({
  fundAccountId,
  amountInRupees,
  narration,
  referenceId,
}) => {
  return rzp.api.post({
    url: '/payouts',
    data: {
      account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
      fund_account_id: fundAccountId,
      amount: Math.round(amountInRupees * 100), // RazorpayX wants paise
      currency: 'INR',
      mode: 'IMPS', // IMPS/NEFT/RTGS/UPI — IMPS works fine in test mode
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: referenceId,
      narration: narration?.slice(0, 30) || 'Vendor settlement',
    },
  });
};
