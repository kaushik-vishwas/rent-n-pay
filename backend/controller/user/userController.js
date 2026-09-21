import User from '../../models/userAuthModel.js';
import Counter from '../../models/Counter.js';
import UserKyc from '../../models/UserKyc.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  sendOTPEmail,
  sendUserForgotPasswordOtp,
  sendWelcomeEmail,
} from '../../utils/sendMail.js';

const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RNP-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const generateUniqueReferralCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = generateReferralCode();
    exists = await User.exists({ referralCode: code });
  }
  return code;
};

const REFERRAL_COMMISSION_RATE = 0.1;
const REFERRAL_COMMISSION_CAP = 1000;

const isTruthy = (value) =>
  ['1', 'true', 'yes', 'on'].includes(
    String(value || '')
      .trim()
      .toLowerCase(),
  );

// const isUserOtpBypassEnabled = () =>
//   isTruthy(
//     process.env.USER_OTP_BYPASS_ENABLED || process.env.OTP_BYPASS_ENABLED,
//   );

// const getUserDummyOtp = () => {
//   const envOtp = String(
//     process.env.USER_DUMMY_OTP || process.env.DUMMY_OTP || '',
//   ).trim();
//   return /^\d{6}$/.test(envOtp) ? envOtp : '123456';
// };
const isUserOtpBypassEnabled = () =>
  isTruthy(
    process.env.USER_OTP_BYPASS_ENABLED || process.env.OTP_BYPASS_ENABLED,
  );

const getUserDummyOtp = () => {
  const envOtp = String(
    process.env.USER_DUMMY_OTP || process.env.DUMMY_OTP || '',
  ).trim();
  return /^\d{6}$/.test(envOtp) ? envOtp : '123456';
};

// Separate bypass flag for mobile OTP (independent of email OTP bypass)
const isMobileOtpBypassEnabled = () =>
  isTruthy(
    process.env.MOBILE_OTP_BYPASS_ENABLED ||
      process.env.USER_OTP_BYPASS_ENABLED,
  );

const getMobileDummyOtp = () => {
  const envOtp = String(process.env.MOBILE_DUMMY_OTP || '').trim();
  return /^\d{6}$/.test(envOtp) ? envOtp : '123456';
};

const shouldExposeUserSignupOtp = () =>
  isTruthy(process.env.USER_SIGNUP_EXPOSE_OTP || process.env.EXPOSE_SIGNUP_OTP);

// const shouldSkipUserOtpEmail = () =>
//   isTruthy(process.env.SKIP_USER_OTP_EMAIL || process.env.SKIP_OTP_EMAIL);
const shouldSkipUserOtpEmail = () =>
  isTruthy(process.env.SKIP_USER_OTP_EMAIL || process.env.SKIP_OTP_EMAIL);

// ── MOBILE OTP AUTH (dummy OTP for now, real SMS gateway to be wired later) ──

// Step 1: user submits mobile number -> check if exists -> "send" OTP (dummy)
export const mobileSendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const cleanMobile = String(mobileNumber || '').trim();

    if (!/^\d{10}$/.test(cleanMobile)) {
      return res
        .status(400)
        .json({ message: 'Enter a valid 10-digit mobile number' });
    }

    // const bypassEnabled = isUserOtpBypassEnabled();
    // const otp = bypassEnabled
    //   ? getUserDummyOtp()
    //   : Math.floor(100000 + Math.random() * 900000).toString();

    // let user = await User.findOne({ mobileNumber: cleanMobile });
    const bypassEnabled = isMobileOtpBypassEnabled();
    const otp = bypassEnabled
      ? getMobileDummyOtp()
      : Math.floor(100000 + Math.random() * 900000).toString();

    let user = await User.findOne({ mobileNumber: cleanMobile });
    const isNewUser = !user;

    if (user) {
      user.mobileOtp = otp;
      user.mobileOtpExpire = Date.now() + 5 * 60 * 1000;
      await user.save();
    }
    // For new users we don't create a User doc yet — that happens at mobileSignup,
    // so we don't collide with the existing emailAddress-required schema validation.

    // TODO: replace with real SMS gateway call. For now, dummy/bypass OTP.

    const payload = {
      message: bypassEnabled
        ? 'OTP generated (test mode)'
        : 'OTP sent to mobile number',
      isNewUser,
    };
    if (bypassEnabled) payload.testOtp = otp;

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Step 2: verify OTP. Only called for EXISTING users to log them in
// (new users skip straight to mobileSignup after OTP is validated client-side).
export const mobileVerifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    const cleanMobile = String(mobileNumber || '').trim();
    const enteredOtp = String(otp || '').trim();

    const user = await User.findOne({ mobileNumber: cleanMobile });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // const bypassEnabled = isUserOtpBypassEnabled();
    // const bypassOtp = getUserDummyOtp();
    // const isBypassMatch = bypassEnabled && enteredOtp === bypassOtp;
    const bypassEnabled = isMobileOtpBypassEnabled();
    const bypassOtp = getMobileDummyOtp();
    const isBypassMatch = bypassEnabled && enteredOtp === bypassOtp;
    const isStoredOtpMatch =
      String(user.mobileOtp || '') === enteredOtp &&
      user.mobileOtpExpire &&
      user.mobileOtpExpire >= Date.now();

    if (!isBypassMatch && !isStoredOtpMatch) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isMobileVerified = true;
    user.mobileOtp = null;
    user.mobileOtpExpire = null;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // res.json({
    //   message: 'Login successful',
    //   token,
    //   user: {
    //     id: user._id,
    //     fullName: user.fullName,
    //     emailAddress: user.emailAddress,
    //     createdAt: user.createdAt,
    //   },
    // });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        emailAddress: user.emailAddress,
        mobileNumber: user.mobileNumber,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Step 3: new mobile user completes signup (name, email, referral code)
export const mobileSignup = async (req, res) => {
  try {
    const {
      mobileNumber,
      fullName,
      emailAddress,
      referralCode: inputReferralCode,
    } = req.body;
    const cleanMobile = String(mobileNumber || '').trim();

    if (!/^\d{10}$/.test(cleanMobile)) {
      return res
        .status(400)
        .json({ message: 'Enter a valid 10-digit mobile number' });
    }

    const existingMobile = await User.findOne({ mobileNumber: cleanMobile });
    if (existingMobile) {
      return res
        .status(400)
        .json({ message: 'Mobile number already registered' });
    }

    const existingEmail = await User.findOne({ emailAddress });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let referredByUserId = null;
    let validatedReferralCode = null;
    if (inputReferralCode) {
      const referrer = await User.findOne({
        referralCode: inputReferralCode.trim().toUpperCase(),
        isVerified: true,
      });
      if (referrer) {
        referredByUserId = referrer._id;
        validatedReferralCode = inputReferralCode.trim().toUpperCase();
      }
    }

    const newUserReferralCode = await generateUniqueReferralCode();

    // Dummy random password since password login isn't used for mobile-auth users.
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = new User({
      fullName,
      emailAddress,
      password: hashedPassword,
      mobileNumber: cleanMobile,
      isMobileVerified: true,
      isVerified: true, // mobile OTP already verified this user
      referralCode: newUserReferralCode,
      referredByCode: validatedReferralCode,
      referredBy: referredByUserId,
    });

    await user.save();

    const c = await Counter.findByIdAndUpdate(
      'userCustomerSeq',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    await User.updateOne(
      { _id: user._id },
      { $set: { customerNumber: c.seq } },
    );

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // res.status(201).json({
    //   message: 'Account created successfully',
    //   token,
    //   user: {
    //     id: user._id,
    //     fullName: user.fullName,
    //     emailAddress: user.emailAddress,
    //     createdAt: user.createdAt,
    //   },
    // });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        emailAddress: user.emailAddress,
        mobileNumber: user.mobileNumber,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const signupUser = async (req, res) => {
  try {
    const {
      fullName,
      emailAddress,
      password,
      referralCode: inputReferralCode,
    } = req.body;
    // inputReferralCode = code the new user typed in signup form (who referred them)

    const existing = await User.findOne({ emailAddress });

    if (existing) {
      if (existing.isVerified) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Re-signup for unverified: regenerate OTP, update details
      const hashedPassword = await bcrypt.hash(password, 10);
      const bypassEnabled = isUserOtpBypassEnabled();
      const otp = bypassEnabled
        ? getUserDummyOtp()
        : Math.floor(100000 + Math.random() * 900000).toString();

      existing.fullName = fullName;
      existing.password = hashedPassword;
      existing.otp = otp;
      existing.otpExpire = Date.now() + 5 * 60 * 1000;
      // Keep existing referredByCode if already set; allow overwrite if blank
      if (inputReferralCode && !existing.referredByCode) {
        const referrer = await User.findOne({
          referralCode: inputReferralCode.trim().toUpperCase(),
        });
        if (referrer) {
          existing.referredByCode = inputReferralCode.trim().toUpperCase();
          existing.referredBy = referrer._id;
        }
      }
      await existing.save();

      const skipOtpEmail = shouldSkipUserOtpEmail();
      if (!bypassEnabled && !skipOtpEmail)
        await sendOTPEmail(emailAddress, otp);

      const payload = {
        message:
          bypassEnabled || skipOtpEmail
            ? 'New OTP generated for testing'
            : 'New OTP sent to email',
      };
      if (bypassEnabled || shouldExposeUserSignupOtp()) payload.testOtp = otp;
      return res.status(200).json(payload);
    }

    // ── NEW user signup ──
    const hashedPassword = await bcrypt.hash(password, 10);
    const bypassEnabled = isUserOtpBypassEnabled();
    const otp = bypassEnabled
      ? getUserDummyOtp()
      : Math.floor(100000 + Math.random() * 900000).toString();

    // Validate the referral code entered by new user (if any)
    let referredByUserId = null;
    let validatedReferralCode = null;
    if (inputReferralCode) {
      const referrer = await User.findOne({
        referralCode: inputReferralCode.trim().toUpperCase(),
        isVerified: true,
      });
      if (referrer) {
        referredByUserId = referrer._id;
        validatedReferralCode = inputReferralCode.trim().toUpperCase();
      }
      // If invalid, we silently ignore (it's optional)
    }

    // Generate this new user's own referral code
    const newUserReferralCode = await generateUniqueReferralCode();

    const user = new User({
      fullName,
      emailAddress,
      password: hashedPassword,
      otp,
      otpExpire: Date.now() + 5 * 60 * 1000,
      referralCode: newUserReferralCode, // user's own code to share
      referredByCode: validatedReferralCode, // code they used (who referred them)
      referredBy: referredByUserId, // ObjectId of referrer
    });

    await user.save();

    // Assign customerNumber
    const c = await Counter.findByIdAndUpdate(
      'userCustomerSeq',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    await User.updateOne(
      { _id: user._id },
      { $set: { customerNumber: c.seq } },
    );

    // const skipOtpEmail = shouldSkipUserOtpEmail();
    // if (!bypassEnabled && !skipOtpEmail) await sendOTPEmail(emailAddress, otp);

    // const exposeOtp = bypassEnabled || shouldExposeUserSignupOtp();
    // const payload = {
    //   message:
    //     bypassEnabled || skipOtpEmail
    //       ? 'Signup successful, use test OTP to verify account'
    //       : 'Signup successful, OTP sent to email',
    // };
    // if (exposeOtp) payload.testOtp = otp;

    // res.status(201).json(payload);

    // const skipOtpEmail = shouldSkipUserOtpEmail();
    // if (!bypassEnabled && !skipOtpEmail) await sendOTPEmail(emailAddress, otp);

    // try {
    //   await sendWelcomeEmail(emailAddress, fullName);
    // } catch (mailErr) {
    //   console.error('Failed to send welcome email:', mailErr.message);
    // }

    // const exposeOtp = bypassEnabled || shouldExposeUserSignupOtp();
    const skipOtpEmail = shouldSkipUserOtpEmail();
    if (!bypassEnabled && !skipOtpEmail)
      await sendOTPEmail(emailAddress, otp, fullName);

    const exposeOtp = bypassEnabled || shouldExposeUserSignupOtp();
    const payload = {
      message:
        bypassEnabled || skipOtpEmail
          ? 'Signup successful, use test OTP to verify account'
          : 'Signup successful, OTP sent to email',
    };
    if (exposeOtp) payload.testOtp = otp;

    res.status(201).json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const triggerReferralCommission = async (buyerId, orderTotal) => {
  try {
    const buyer = await User.findById(buyerId);
    if (!buyer) return;

    if (buyer.firstOrderCompleted) return;
    if (!buyer.referredBy) {
      await User.findByIdAndUpdate(buyerId, { firstOrderCompleted: true });
      return;
    }

    const commissionAmount = Math.min(
      Math.round(orderTotal * REFERRAL_COMMISSION_RATE),
      REFERRAL_COMMISSION_CAP,
    );

    // await User.findByIdAndUpdate(buyerId, {
    //   firstOrderCompleted: true,
    //   referralCommissionEarned: commissionAmount,
    // });
    await User.findByIdAndUpdate(buyerId, {
      firstOrderCompleted: true,
      referralCommissionEarned: commissionAmount,
      referralCommissionEarnedAt: new Date(),
    });

    await User.findByIdAndUpdate(buyer.referredBy, {
      $inc: { referralEarnings: commissionAmount },
    });

    console.log(
      `[Referral] ₹${commissionAmount} credited to referrer ${buyer.referredBy} from buyer ${buyerId}`,
    );
  } catch (err) {
    console.error('[Referral] triggerReferralCommission error:', err.message);
  }
};

export const getReferralDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    let user = await User.findById(userId).select(
      'referralCode referralEarnings withdrawnAmount bankDetails withdrawals fullName',
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.referralCode) {
      user.referralCode = await generateUniqueReferralCode();
      await user.save();
    }

    // const referees = await User.find({ referredBy: userId }).select(
    //   'fullName emailAddress firstOrderCompleted createdAt customerNumber',
    // );
    const referees = await User.find({ referredBy: userId }).select(
      'fullName emailAddress firstOrderCompleted createdAt customerNumber referralCommissionEarned referralCommissionEarnedAt referralPaymentStatus referralPaidAt referralTransactionId',
    );

    const availableBalance = user.referralEarnings - user.withdrawnAmount;

    res.json({
      referralCode: user.referralCode,
      fullName: user.fullName,
      totalEarnings: user.referralEarnings,
      withdrawnAmount: user.withdrawnAmount,
      availableBalance,
      bankDetails: user.bankDetails,
      withdrawals: user.withdrawals,
      // referees: referees.map((r) => ({
      //   id: r._id,
      //   name: r.fullName,
      //   email: r.emailAddress,
      //   joinedAt: r.createdAt,
      //   status: r.firstOrderCompleted ? 'Order Placed' : 'Pending',
      //   commission: r.firstOrderCompleted
      //     ? `₹${Math.min(Math.round(0 * REFERRAL_COMMISSION_RATE), REFERRAL_COMMISSION_CAP)}`
      //     : '--',
      // })),
      referees: referees.map((r) => ({
        id: r._id,
        sourceId: `USR-${r.customerNumber || r._id.toString().slice(-4)}`,
        name: r.fullName,
        email: r.emailAddress,
        joinedAt: r.createdAt,
        status: r.firstOrderCompleted ? 'Order Placed' : 'Pending',
        commissionEarned: r.referralCommissionEarned || 0,
        commissionEarnedAt: r.referralCommissionEarnedAt || null,
        paymentStatus: r.referralPaymentStatus || 'unpaid',
        paidAt: r.referralPaidAt || null,
        transactionId: r.referralTransactionId || null,
      })),
      totalReferees: referees.length,
      verifiedReferees: referees.filter((r) => r.firstOrderCompleted).length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBankDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { accountName, accountNumber, ifscCode, bankName } = req.body;

    await User.findByIdAndUpdate(userId, {
      bankDetails: { accountName, accountNumber, ifscCode, bankName },
    });

    res.json({ message: 'Bank details updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const availableBalance = user.referralEarnings - user.withdrawnAmount;
    if (amount > availableBalance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    if (!user.bankDetails?.accountNumber) {
      return res
        .status(400)
        .json({ message: 'Please add bank details before withdrawing' });
    }

    // Referral withdrawals are always queued — the daily referral payout
    // cron (runReferralPayoutBatch) pays out anything 5+ days old via
    // RazorpayX. We reserve the amount now so the user can't request more
    // than their available balance while a request is still pending.
    // The bank details are snapshotted onto the withdrawal itself, so if
    // the user edits their bank details afterward, this already-queued
    // withdrawal still pays out to the account they had on file when they
    // clicked Withdraw — not wherever they change it to later.
    const withdrawal = {
      amount,
      status: 'pending',
      requestedAt: new Date(),
      processedAt: null,
      utr: null,
      payoutBankSnapshot: {
        accountName: user.bankDetails.accountName,
        accountNumber: user.bankDetails.accountNumber,
        ifscCode: user.bankDetails.ifscCode,
        bankName: user.bankDetails.bankName,
      },
    };

    user.withdrawals.push(withdrawal);
    user.withdrawnAmount += amount;
    await user.save();

    res.json({
      message: `We got your referral withdrawal request for ₹${amount}! It will be processed within 5 business days.`,
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markRefereesPaidForWithdrawal = async (
  referrerId,
  withdrawalAmount,
  utr,
  withdrawalId,
) => {
  const unpaidReferees = await User.find({
    referredBy: referrerId,
    referralCommissionEarned: { $gt: 0 },
    referralPaymentStatus: 'unpaid',
  }).sort({ referralCommissionEarnedAt: 1, createdAt: 1 });

  let remaining = withdrawalAmount;
  for (const referee of unpaidReferees) {
    if (remaining < referee.referralCommissionEarned) break;
    referee.referralPaymentStatus = 'paid';
    referee.referralPaidAt = new Date();
    referee.referralTransactionId = utr || null;
    referee.referralWithdrawalId = withdrawalId;
    await referee.save();
    remaining -= referee.referralCommissionEarned;
  }
};

export const adminGetReferralActivity = async (req, res) => {
  try {
    const referrers = await User.find({
      referralCode: { $exists: true, $ne: null },
    }).select(
      'fullName referralCode referralEarnings withdrawnAmount createdAt customerNumber withdrawals',
    );

    const result = await Promise.all(
      referrers.map(async (referrer) => {
        // const referees = await User.find({ referredBy: referrer._id }).select(
        //   'fullName emailAddress firstOrderCompleted referralCommissionEarned createdAt customerNumber',
        // );
        const referees = await User.find({ referredBy: referrer._id }).select(
          'fullName emailAddress firstOrderCompleted referralCommissionEarned createdAt customerNumber referralCommissionEarnedAt referralPaymentStatus referralPaidAt referralTransactionId',
        );

        const refereeIds = referees.map((r) => r._id);
        const kycRecords = await UserKyc.find({
          userId: { $in: refereeIds },
          status: 'approved',
        }).select('userId');
        const approvedKycIds = new Set(
          kycRecords.map((k) => k.userId.toString()),
        );

        const pendingWithdrawals = (referrer.withdrawals || [])
          .filter((w) => w.status === 'pending')
          .map((w) => ({
            _id: w._id,
            amount: w.amount,
            requestedAt: w.requestedAt,
          }));

        return {
          id: referrer._id,
          sourceId: referrer.customerNumber
            ? `CUST-${String(referrer.customerNumber).padStart(3, '0')}`
            : `CUST-${referrer._id.toString().slice(-4)}`,
          name: referrer.fullName,
          referralCode: referrer.referralCode,
          totalInvites: referees.filter(
            (r) =>
              r.firstOrderCompleted || approvedKycIds.has(r._id.toString()),
          ).length,
          joinDate: referrer.createdAt,
          totalEarned: referrer.referralEarnings,
          availableBalance:
            referrer.referralEarnings - referrer.withdrawnAmount,
          pendingWithdrawals,
          referees: referees.map((r) => {
            const kycApproved = approvedKycIds.has(r._id.toString());

            let status = 'Pending';
            if (r.firstOrderCompleted) status = 'Order Placed';
            else if (kycApproved) status = 'KYC Approved';

            // return {
            //   id: r._id,
            //   sourceId: `USR-${r.customerNumber || r._id.toString().slice(-4)}`,
            //   name: r.fullName,
            //   email: r.emailAddress,
            //   status,
            //   joinDate: r.createdAt,
            //   commissionEarned: r.referralCommissionEarned || 0,
            // };
            return {
              id: r._id,
              sourceId: r.customerNumber
                ? `CUST-${String(r.customerNumber).padStart(3, '0')}`
                : `CUST-${r._id.toString().slice(-4)}`,
              name: r.fullName,
              email: r.emailAddress,
              status,
              joinDate: r.createdAt,
              commissionEarned: r.referralCommissionEarned || 0,
              commissionEarnedAt: r.referralCommissionEarnedAt || null,
              paymentStatus: r.referralPaymentStatus || 'unpaid',
              paidAt: r.referralPaidAt || null,
              transactionId: r.referralTransactionId || null,
            };
          }),
        };
      }),
    );

    const totalReferrers = result.filter((r) => r.referees.length > 0).length;
    const totalReferees = result.reduce((sum, r) => sum + r.referees.length, 0);
    // const totalDiscountsEarned = result.reduce(
    //   (sum, r) => sum + r.totalEarned,
    //   0,
    // );
    const totalDiscountsEarned = result.reduce(
      (sum, r) =>
        sum + r.referees.reduce((s, ref) => s + (ref.commissionEarned || 0), 0),
      0,
    );
    const verifiedReferees = result.reduce(
      (sum, r) =>
        sum + r.referees.filter((ref) => ref.status !== 'Pending').length,
      0,
    );

    res.json({
      stats: {
        totalReferrers,
        totalReferees,
        totalDiscountsEarned,
        verifiedReferees,
      },
      referrers: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminProcessWithdrawal = async (req, res) => {
  try {
    const { userId, withdrawalId } = req.params;
    const { status, utr } = req.body;

    if (!['paid', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be paid or failed' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const withdrawal = user.withdrawals.id(withdrawalId);
    if (!withdrawal)
      return res.status(404).json({ message: 'Withdrawal not found' });

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }

    // withdrawal.status = status;
    // withdrawal.processedAt = new Date();
    // withdrawal.utr = utr || null;

    // if (status === 'paid') {
    //   user.withdrawnAmount += withdrawal.amount;
    // }

    // await user.save();
    // res.json({ message: `Withdrawal marked as ${status}`, withdrawal });
    withdrawal.status = status;
    withdrawal.processedAt = new Date();
    withdrawal.utr = utr || null;

    if (status === 'paid') {
      user.withdrawnAmount += withdrawal.amount;
    }

    await user.save();

    if (status === 'paid') {
      await markRefereesPaidForWithdrawal(
        userId,
        withdrawal.amount,
        utr,
        withdrawal._id,
      );
    }

    res.json({ message: `Withdrawal marked as ${status}`, withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
export const verifyUserOTP = async (req, res) => {
  try {
    const { emailAddress, otp } = req.body;

    const user = await User.findOne({ emailAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const enteredOtp = String(otp || '').trim();
    const bypassEnabled = isUserOtpBypassEnabled();
    const bypassOtp = getUserDummyOtp();
    const isBypassMatch = bypassEnabled && enteredOtp === bypassOtp;
    const isStoredOtpMatch =
      String(user.otp || '') === enteredOtp &&
      user.otpExpire &&
      user.otpExpire >= Date.now();

    if (!isBypassMatch && !isStoredOtpMatch) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.json({ message: 'Account verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendUserForgotPasswordOtpController = async (req, res) => {
  try {
    const { emailAddress } = req.body;

    const user = await User.findOne({ emailAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendUserForgotPasswordOtp(emailAddress, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const verifyForgotOtp = async (req, res) => {
  try {
    const { emailAddress, otp } = req.body;
    console.log('request otp:', otp);

    const user = await User.findOne({ emailAddress });
    console.log('db user:', user);
    console.log('db otp:', user?.otp);
    console.log('db otpExpire:', user?.otpExpire);
    console.log('now:', Date.now());

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp || !user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
      });
    }

    res.json({
      message: 'OTP verified successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { emailAddress, otp } = req.body;

    const user = await User.findOne({ emailAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp || !user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
      });
    }

    res.json({
      message: 'OTP verified successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { emailAddress, otp, newPassword } = req.body;

    const user = await User.findOne({ emailAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp || !user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.json({
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Login
export const loginUser = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    const user = await User.findOne({ emailAddress });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id }, // 👈 IMPORTANT (different from vendorId)
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        emailAddress: user.emailAddress,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Logout
export const userLogout = async (req, res) => {
  res.json({ message: 'User logged out successfully' });
};

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailAddress } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (
      String(emailAddress || '')
        .trim()
        .toLowerCase() !==
      String(user.emailAddress || '')
        .trim()
        .toLowerCase()
    ) {
      return res.status(400).json({ message: 'Email address does not match' });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
