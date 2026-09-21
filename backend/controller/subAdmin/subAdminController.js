import jwt from 'jsonwebtoken';
import Admin from '../../models/Admin.js';
import {
  uniqueCityAdminUsername,
  cityAdminPasswordFromName,
} from '../../utils/cityAdminCredentials.js';

// ---- Register as SubAdmin ----
export const registerSubAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, location } = req.body;

    if (!name || !email || !password || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const subAdmin = await Admin.create({
      name,
      email,
      phone,
      password,
      plainPassword: password,
      location,
      role: 'subadmin',
      approvalStatus: 'pending', // must wait for admin approval
    });

    return res.status(201).json({
      message: 'Registration successful. Waiting for admin approval.',
      subAdminId: subAdmin._id,
    });
  } catch (error) {
    console.error('SubAdmin registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- Admin: list pending subadmins ----
// export const getPendingSubAdmins = async (req, res) => {
//   try {
//     const pending = await Admin.find({
//       role: 'subadmin',
//       approvalStatus: 'pending',
//     }).select('-password');
//     res.status(200).json({ pending });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// ---- Admin: list pending subadmins ----
export const getPendingSubAdmins = async (req, res) => {
  try {
    const pending = await Admin.find({
      role: 'subadmin',
      approvalStatus: 'pending',
    }).select('+password');
    res.status(200).json({ pending });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- Admin: approve or reject subadmin ----
export const updateSubAdminApproval = async (req, res) => {
  try {
    const { subAdminId } = req.params;
    const { status } = req.body; // "approved" | "rejected"

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const subAdmin = await Admin.findById(subAdminId);
    if (!subAdmin || subAdmin.role !== 'subadmin') {
      return res.status(404).json({ message: 'SubAdmin not found' });
    }

    subAdmin.approvalStatus = status;
    subAdmin.approvedBy = req.admin?._id || null; // set by your auth middleware
    subAdmin.approvedAt = new Date();
    await subAdmin.save();

    res.status(200).json({ message: `SubAdmin ${status}`, subAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- Admin: get all subadmins (approved list too) ----
// export const getAllSubAdmins = async (req, res) => {
//   try {
//     const subAdmins = await Admin.find({ role: 'subadmin' }).select(
//       '-password',
//     );
//     res.status(200).json({ subAdmins });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// ---- Admin: get all subadmins (approved list too) ----
export const getAllSubAdmins = async (req, res) => {
  try {
    const subAdmins = await Admin.find({ role: 'subadmin' }).select(
      '+plainPassword',
    );
    res.status(200).json({ subAdmins });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- NEW: Admin updates an existing SubAdmin ----
export const updateSubAdminByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, location, approvalStatus } = req.body;

    const subAdmin = await Admin.findById(id);
    if (!subAdmin || subAdmin.role !== 'subadmin') {
      return res.status(404).json({ message: 'SubAdmin not found' });
    }

    if (email && email !== subAdmin.email) {
      const existing = await Admin.findOne({ email });
      if (existing && String(existing._id) !== String(subAdmin._id)) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      subAdmin.email = email;
    }

    if (name) subAdmin.name = name;
    if (location) subAdmin.location = location;
    if (['pending', 'approved', 'rejected'].includes(approvalStatus)) {
      subAdmin.approvalStatus = approvalStatus;
    }

    // Only touch password if a new one was actually provided
    if (password && password.trim()) {
      subAdmin.password = password; // pre-save hook hashes it
      subAdmin.plainPassword = password;
    }

    await subAdmin.save();

    const subAdminSafe = subAdmin.toObject();
    delete subAdminSafe.password;

    res.status(200).json({
      message: 'SubAdmin updated successfully',
      subAdmin: subAdminSafe,
    });
  } catch (error) {
    console.error('Admin update subadmin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- NEW: Admin creates a SubAdmin directly (pre-approved, no self-registration) ----
export const createSubAdminByAdmin = async (req, res) => {
  try {
    const { name, phone, location, email, password: rawPassword } = req.body;

    if (!name || !location) {
      return res
        .status(400)
        .json({ message: 'City name and location are required' });
    }

    const username = email
      ? String(email).trim().toLowerCase()
      : await uniqueCityAdminUsername(name);

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const existing = await Admin.findOne({ email: username });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'Username already in use. Choose another.' });
    }

    const password = rawPassword
      ? String(rawPassword)
      : cityAdminPasswordFromName(name);

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    const subAdmin = await Admin.create({
      name: String(name).trim(),
      email: username,
      phone: phone || null,
      password,
      plainPassword: password,
      location,
      role: 'subadmin',
      approvalStatus: 'approved',
      approvedBy: req.admin?._id || null,
      approvedAt: new Date(),
    });

    const subAdminSafe = subAdmin.toObject();
    delete subAdminSafe.password;

    res.status(201).json({
      message:
        'City admin created. Copy the username and password now — share them for login.',
      subAdmin: subAdminSafe,
      credentials: {
        username,
        password,
      },
    });
  } catch (error) {
    console.error('Admin create subadmin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
