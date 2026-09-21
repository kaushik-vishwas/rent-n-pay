import InvestorEnquiry from '../models/InvestorEnquiry.js';

function normStr(v) {
  return String(v ?? '').trim();
}

export const createInvestorEnquiry = async (req, res) => {
  try {
    const subject = normStr(req.body?.subject);
    const fullName = normStr(req.body?.fullName);
    const emailAddress = normStr(req.body?.emailAddress).toLowerCase();
    const phoneNumber = normStr(req.body?.phoneNumber);
    const companyName = normStr(req.body?.companyName);
    const investmentRange = normStr(req.body?.investmentRange);
    const message = normStr(req.body?.message);

    if (!fullName) {
      return res.status(400).json({ message: 'Full name is required.' });
    }

    const doc = await InvestorEnquiry.create({
      subject,
      fullName,
      emailAddress,
      phoneNumber,
      companyName,
      investmentRange,
      message,
    });

    return res.status(201).json({
      message: 'Enquiry submitted.',
      enquiryId: String(doc._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

