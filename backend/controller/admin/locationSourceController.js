import LocationSourceSettings from '../../models/LocationSourceSettings.js';

const normalizeState = (raw) =>
  String(raw || '')
    .trim()
    .toLowerCase();

// ---- Sub-admin: get their own state's toggle settings ----
export const getMyLocationSettings = async (req, res) => {
  try {
    if (req.admin.role !== 'subadmin') {
      return res
        .status(403)
        .json({ message: 'Only sub-admins can access this.' });
    }
    if (req.admin.approvalStatus !== 'approved') {
      return res
        .status(403)
        .json({ message: 'Your account is not yet approved.' });
    }
    const state = normalizeState(req.admin.location);
    if (!state) {
      return res
        .status(400)
        .json({ message: 'No location assigned to this account.' });
    }

    let doc = await LocationSourceSettings.findOne({ state });
    if (!doc) {
      // Default: everything enabled until a sub-admin explicitly toggles.
      doc = {
        state,
        rentEnabled: true,
        buyEnabled: true,
        serviceEnabled: true,
      };
    }

    return res.status(200).json({
      state: doc.state,
      rentEnabled: doc.rentEnabled,
      buyEnabled: doc.buyEnabled,
      serviceEnabled: doc.serviceEnabled,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ---- Sub-admin: update their own state's toggle settings ----
export const updateMyLocationSettings = async (req, res) => {
  try {
    if (req.admin.role !== 'subadmin') {
      return res
        .status(403)
        .json({ message: 'Only sub-admins can access this.' });
    }
    if (req.admin.approvalStatus !== 'approved') {
      return res
        .status(403)
        .json({ message: 'Your account is not yet approved.' });
    }
    const state = normalizeState(req.admin.location);
    if (!state) {
      return res
        .status(400)
        .json({ message: 'No location assigned to this account.' });
    }

    const { rentEnabled, buyEnabled, serviceEnabled } = req.body;
    const update = { updatedBy: req.admin.email || 'subadmin' };
    if (typeof rentEnabled === 'boolean') update.rentEnabled = rentEnabled;
    if (typeof buyEnabled === 'boolean') update.buyEnabled = buyEnabled;
    if (typeof serviceEnabled === 'boolean')
      update.serviceEnabled = serviceEnabled;

    const doc = await LocationSourceSettings.findOneAndUpdate(
      { state },
      { $set: update, $setOnInsert: { state } },
      { new: true, upsert: true },
    );

    return res.status(200).json({
      message: 'Location settings updated.',
      state: doc.state,
      rentEnabled: doc.rentEnabled,
      buyEnabled: doc.buyEnabled,
      serviceEnabled: doc.serviceEnabled,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
