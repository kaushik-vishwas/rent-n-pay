import InvestorEnquiry from '../../models/InvestorEnquiry.js';

function toIsoDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
}

export const listInvestorEnquiries = async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { emailAddress: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const rows = await InvestorEnquiry.find(query).sort({ createdAt: -1 }).lean();
    const enquiries = (rows || []).map((r) => ({
      _id: String(r._id),
      createdAt: toIsoDate(r.createdAt),
      isRead: r.isRead === true,
      subject: r.subject || '',
      fullName: r.fullName || '',
      companyName: r.companyName || '',
      investmentRange: r.investmentRange || '',
      emailAddress: r.emailAddress || '',
      phoneNumber: r.phoneNumber || '',
    }));

    const total = enquiries.length;
    const unread = enquiries.filter((e) => !e.isRead).length;

    return res.json({ enquiries, counts: { total, unread } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getInvestorEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await InvestorEnquiry.findById(id).lean();
    if (!r) return res.status(404).json({ message: 'Enquiry not found.' });

    return res.json({
      enquiry: {
        _id: String(r._id),
        createdAt: toIsoDate(r.createdAt),
        updatedAt: toIsoDate(r.updatedAt),
        isRead: r.isRead === true,
        readAt: toIsoDate(r.readAt),
        subject: r.subject || '',
        fullName: r.fullName || '',
        companyName: r.companyName || '',
        investmentRange: r.investmentRange || '',
        emailAddress: r.emailAddress || '',
        phoneNumber: r.phoneNumber || '',
        message: r.message || '',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markInvestorEnquiryRead = async (req, res) => {
  try {
    const { id } = req.params;
    const raw = req.body?.isRead;
    const isRead = raw === true || raw === 'true';

    const enquiry = await InvestorEnquiry.findById(id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });

    enquiry.isRead = isRead;
    enquiry.readAt = isRead ? new Date() : null;
    await enquiry.save();

    return res.json({
      message: 'Enquiry updated.',
      enquiry: {
        _id: String(enquiry._id),
        isRead: enquiry.isRead === true,
        readAt: toIsoDate(enquiry.readAt),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

