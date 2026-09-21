import ServiceListingTemplate from '../../models/ServiceListingTemplate.js';

const vendorTemplateActiveQuery = () => ({
  /** Admin “toggle off” sets `isActive: false`; hide those from vendor catalog. */
  isActive: { $ne: false },
});

export const listServiceListingTemplatesForVendor = async (req, res) => {
  try {
    const q = String(req.query.q || '').trim().toLowerCase();
    const listingTemplates = await ServiceListingTemplate.find(
      vendorTemplateActiveQuery(),
    )
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    if (!q) return res.json({ serviceListingTemplates: listingTemplates });

    const filtered = listingTemplates.filter((t) => {
      const name = String(t.productName || '').toLowerCase();
      const cat = String(t.category || '').toLowerCase();
      const sub = String(t.subCategory || '').toLowerCase();
      return name.includes(q) || cat.includes(q) || sub.includes(q);
    });

    return res.json({ serviceListingTemplates: filtered });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getServiceListingTemplateForVendor = async (req, res) => {
  try {
    const doc = await ServiceListingTemplate.findOne({
      _id: req.params.id,
      ...vendorTemplateActiveQuery(),
    }).lean();

    if (!doc) {
      return res
        .status(404)
        .json({ message: 'Service listing template not found' });
    }
    return res.json({ serviceListingTemplate: doc });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

