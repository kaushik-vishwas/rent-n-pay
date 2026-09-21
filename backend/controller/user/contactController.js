import Contact from '../../models/Contact.js';

export const submitContact = async (req, res) => {
  try {
    const { subject, fullName, email, phone, message } = req.body;

    if (!subject || !fullName || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields',
      });
    }

    const contact = await Contact.create({
      subject,
      fullName,
      email,
      phone,
      message,
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later',
    });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later',
    });
  }
};
