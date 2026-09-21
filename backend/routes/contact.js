import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

/**
 * CREATE USER QUERY
 */
router.post("/", async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newContact = await Contact.create({
      fullName,
      email,
      phone,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Query submitted successfully",
      data: newContact,
    });
  } catch (err) {
    console.error("Contact submit error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to submit query",
    });
  }
});

/**
 * GET USER CONTACT TICKETS (ADMIN)
 */
router.get("/tickets", async (req, res) => {
  try {
    const contacts = await Contact.find({}).lean();

    console.log("CONTACT TICKETS FROM DB:", contacts.length);

    const tickets = contacts.map((c) => ({
      _id: c._id,
      orderId: `contact_${c._id}`,
      queryId: `QRY-${String(c._id).slice(-6)}`,
      customerName: c.fullName || "Unknown",
      email: c.email,
      phone: c.phone,
      subject: c.subject,
      productName: c.subject || "User Query",
      message: c.message,
      status: c.status || "pending",
      createdAt: c.createdAt,
      source: "user",
    }));

    return res.json({
      success: true,
      tickets,
    });
  } catch (err) {
    console.error("CONTACT FETCH ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact tickets",
    });
  }
});

export default router;