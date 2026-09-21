// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";

// import adminRoutes from "./routes/admin.js";
// import vendorRoutes from "./routes/vendor.js";
// import contactRoutes from "./routes/contact.js";
// import Contact from "./models/Contact.js";
// import productRoutes from './routes/products.js';
// import categoryRoutes from './routes/categories.js';
// import cartRoutes from './routes/cart.js';
// import orderRoutes from './routes/orders.js';
// import userRoutes from './routes/users.js';
// import serviceProductRoutes from './routes/service.js';
// import bookingRoutes from './routes/bookings.js';
// import brevoTestRoutes from './routes/brevoTest.js';
// import ensureUserCustomerNumbers from './utils/ensureUserCustomerNumbers.js';
// import reviewRoutes from './routes/review.js';

// const app = express();

// /* =========================
//    CORS CONFIG
// ========================= */

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "https://rentnpay-admin.vercel.app",
//   "https://rentnpay.vercel.app",
//   ...(process.env.CORS_ORIGINS || "")
//     .split(",")
//     .map((x) => x.trim())
//     .filter(Boolean),
// ];

// const corsOptions = {
//   origin(origin, cb) {
//     if (!origin) return cb(null, true);

//     const raw = String(origin).trim();
//     const lower = raw.toLowerCase();
//     const isVercelApp = lower.endsWith(".vercel.app");

//     if (allowedOrigins.includes(raw) || isVercelApp) {
//       return cb(null, true);
//     }

//     return cb(new Error("Not allowed by CORS"));
//   },

//   credentials: true,

//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Requested-With",
//     "Accept",
//     "Origin",
//   ],

//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

// app.use(express.json());
// app.use(express.static("uploads"));

// /* =========================
//    FAILSAFE CORS HEADERS
// ========================= */

// app.use((req, res, next) => {
//   const origin = req.headers.origin;

//   if (origin) {
//     const lower = String(origin).toLowerCase();

//     const isAllowed =
//       allowedOrigins.includes(origin) ||
//       lower.endsWith(".vercel.app");

//     if (isAllowed) {
//       res.header("Access-Control-Allow-Origin", origin);
//       res.header("Vary", "Origin");
//     }
//   }

//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET,POST,PUT,PATCH,DELETE,OPTIONS"
//   );

//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, X-Requested-With, Accept, Origin"
//   );

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }

//   next();
// });

// /* =========================
//    HEALTH CHECK
// ========================= */

// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     ok: true,
//     service: "rentpay-server",
//     uptimeSeconds: Math.floor(process.uptime()),
//     timestamp: new Date().toISOString(),
//   });
// });

// /* =========================
//    CONTACT ROUTES
// ========================= */
// // Routes
// app.use('/api/admin', adminRoutes);
// app.use('/api/vendor', vendorRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/brevo-test', brevoTestRoutes);
// app.use('/api/service-products', serviceProductRoutes);
// app.use('/api/reviews', reviewRoutes);

// app.use("/api/contact", contactRoutes);

// /* =========================
//    ADMIN CONTACT TICKETS
// ========================= */

// app.get("/api/admin/contact-tickets", async (req, res) => {
//   try {
//     const contacts = await Contact.find().sort({
//       createdAt: -1,
//     });

//     const tickets = contacts.map((c) => ({
//       _id: c._id,
//       customerName: c.fullName,
//       email: c.email,
//       phone: c.phone,
//       subject: c.subject,
//       message: c.message,
//       status: c.status || "pending",
//       createdAt: c.createdAt,
//       source: "user",
//     }));

//     res.json({
//       success: true,
//       tickets,
//     });
//   } catch (err) {
//     console.error("Contact tickets error:", err);

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch contact tickets",
//     });
//   }
// });

// /* =========================
//    ERROR HANDLER
// ========================= */

// app.use((err, req, res, next) => {
//   res.status(err.status || 500).json({
//     message: err.message || "Server error",
//   });
// });

// /* =========================
//    DB CONNECTION
// ========================= */

// const mongoUri = process.env.MONGODB_URI?.trim();

// if (!mongoUri) {
//   console.error("MONGODB_URI is not set");
//   process.exit(1);
// }

// async function connectMongo() {
//   const fallback =
//     process.env.MONGODB_URI_FALLBACK?.trim();

//   try {
//     await mongoose.connect(mongoUri);

//     return {
//       uri: mongoUri,
//       usedFallback: false,
//     };
//   } catch (err) {
//     if (fallback && fallback !== mongoUri) {
//       await mongoose.connect(fallback);

//       return {
//         uri: fallback,
//         usedFallback: true,
//       };
//     }

//     throw err;
//   }
// }

// /* =========================
//    START SERVER
// ========================= */

// connectMongo()
//   .then(async ({ usedFallback }) => {
//     console.log(
//       usedFallback
//         ? "MongoDB Connected (fallback)"
//         : "MongoDB Connected"
//     );

//     try {
//       await ensureUserCustomerNumbers();
//     } catch (e) {
//       console.error(
//         "ensureUserCustomerNumbers:",
//         e?.message || e
//       );
//     }

//     const PORT = process.env.PORT || 5001;

//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })

//   .catch((err) => {
//     console.error(
//       "MongoDB connection error:",
//       err
//     );

//     process.exit(1);
//   });

// import dotenv from 'dotenv';
// dotenv.config();

// import express from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';

// import adminRoutes from './routes/admin.js';
// import vendorRoutes from './routes/vendor.js';
// import contactRoutes from './routes/contact.js';
// import Contact from './models/Contact.js';
// import productRoutes from './routes/products.js';
// import categoryRoutes from './routes/categories.js';
// import cartRoutes from './routes/cart.js';
// import orderRoutes from './routes/orders.js';
// import userRoutes from './routes/users.js';
// import serviceProductRoutes from './routes/service.js';
// import bookingRoutes from './routes/bookings.js';
// import brevoTestRoutes from './routes/brevoTest.js';
// import ensureUserCustomerNumbers from './utils/ensureUserCustomerNumbers.js';
// import reviewRoutes from './routes/review.js';

// const app = express();

// /* =========================
//    CORS CONFIG
// ========================= */

// const allowedOrigins = [
//   'http://localhost:3000',
//   'http://localhost:3001',
//   'https://rentnpay-admin.vercel.app',
//   'https://rentnpay.vercel.app',
//   ...(process.env.CORS_ORIGINS || '')
//     .split(',')
//     .map((x) => x.trim())
//     .filter(Boolean),
// ];

// const corsOptions = {
//   origin(origin, cb) {
//     if (!origin) return cb(null, true);

//     const raw = String(origin).trim();
//     const lower = raw.toLowerCase();
//     const isVercelApp = lower.endsWith('.vercel.app');

//     if (allowedOrigins.includes(raw) || isVercelApp) {
//       return cb(null, true);
//     }

//     return cb(new Error('Not allowed by CORS'));
//   },

//   credentials: true,

//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

//   allowedHeaders: [
//     'Content-Type',
//     'Authorization',
//     'X-Requested-With',
//     'Accept',
//     'Origin',
//   ],

//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

// app.use(express.json());
// app.use(express.static('uploads'));

// /* =========================
//    FAILSAFE CORS HEADERS
// ========================= */

// app.use((req, res, next) => {
//   const origin = req.headers.origin;

//   if (origin) {
//     const lower = String(origin).toLowerCase();

//     const isAllowed =
//       allowedOrigins.includes(origin) || lower.endsWith('.vercel.app');

//     if (isAllowed) {
//       res.header('Access-Control-Allow-Origin', origin);
//       res.header('Vary', 'Origin');
//     }
//   }

//   res.header(
//     'Access-Control-Allow-Methods',
//     'GET,POST,PUT,PATCH,DELETE,OPTIONS',
//   );

//   res.header(
//     'Access-Control-Allow-Headers',
//     'Content-Type, Authorization, X-Requested-With, Accept, Origin',
//   );

//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }

//   next();
// });

// /* =========================
//    HEALTH CHECK
// ========================= */

// app.get('/api/health', (req, res) => {
//   res.status(200).json({
//     ok: true,
//     service: 'rentpay-server',
//     uptimeSeconds: Math.floor(process.uptime()),
//     timestamp: new Date().toISOString(),
//   });
// });

// /* =========================
//    CONTACT ROUTES
// ========================= */
// // Routes
// app.use('/api/admin', adminRoutes);
// app.use('/api/vendor', vendorRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/brevo-test', brevoTestRoutes);
// app.use('/api/service-products', serviceProductRoutes);
// app.use('/api/reviews', reviewRoutes);

// app.use('/api/contact', contactRoutes);

// /* =========================
//    ADMIN CONTACT TICKETS
// ========================= */

// app.get('/api/admin/contact-tickets', async (req, res) => {
//   try {
//     const contacts = await Contact.find().sort({
//       createdAt: -1,
//     });

//     const tickets = contacts.map((c) => ({
//       _id: c._id,
//       customerName: c.fullName,
//       email: c.email,
//       phone: c.phone,
//       subject: c.subject,
//       message: c.message,
//       status: c.status || 'pending',
//       createdAt: c.createdAt,
//       source: 'user',
//     }));

//     res.json({
//       success: true,
//       tickets,
//     });
//   } catch (err) {
//     console.error('Contact tickets error:', err);

//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch contact tickets',
//     });
//   }
// });

// /* =========================
//    ERROR HANDLER
// ========================= */

// app.use((err, req, res, next) => {
//   res.status(err.status || 500).json({
//     message: err.message || 'Server error',
//   });
// });

// /* =========================
//    DB CONNECTION
// ========================= */

// const mongoUri = process.env.MONGODB_URI?.trim();

// if (!mongoUri) {
//   console.error('MONGODB_URI is not set');
//   process.exit(1);
// }

// async function connectMongo() {
//   const fallback = process.env.MONGODB_URI_FALLBACK?.trim();

//   try {
//     await mongoose.connect(mongoUri);

//     return {
//       uri: mongoUri,
//       usedFallback: false,
//     };
//   } catch (err) {
//     if (fallback && fallback !== mongoUri) {
//       await mongoose.connect(fallback);

//       return {
//         uri: fallback,
//         usedFallback: true,
//       };
//     }

//     throw err;
//   }
// }

// /* =========================
//    START SERVER
// ========================= */

// connectMongo()
//   .then(async ({ usedFallback }) => {
//     console.log(
//       usedFallback ? 'MongoDB Connected (fallback)' : 'MongoDB Connected',
//     );

//     // try {
//     //   await ensureUserCustomerNumbers();
//     // } catch (e) {
//     //   console.error('ensureUserCustomerNumbers:', e?.message || e);
//     // }

//     // const PORT = process.env.PORT || 5001;

//     try {
//       await ensureUserCustomerNumbers();
//     } catch (e) {
//       console.error('ensureUserCustomerNumbers:', e?.message || e);
//     }

//     // One-time cleanup: drop legacy settlements index if it still exists
//     try {
//       const indexes = await mongoose.connection.db
//         .collection('settlements')
//         .indexes();
//       const hasOldIndex = indexes.some(
//         (i) => i.name === 'orderId_1_vendorId_1',
//       );
//       if (hasOldIndex) {
//         await mongoose.connection.db
//           .collection('settlements')
//           .dropIndex('orderId_1_vendorId_1');
//         console.log('Dropped legacy settlements index: orderId_1_vendorId_1');
//       }
//     } catch (e) {
//       console.error('Settlement index cleanup skipped:', e?.message || e);
//     }

//     const PORT = process.env.PORT || 5001;

//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })

//   .catch((err) => {
//     console.error('MongoDB connection error:', err);

//     process.exit(1);
//   });

// import dotenv from 'dotenv';
// dotenv.config();

import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import adminRoutes from './routes/admin.js';
import vendorRoutes from './routes/vendor.js';
import contactRoutes from './routes/contact.js';
import invoicePdfRoutes from './routes/invoicePdfRoutes.js';
import Contact from './models/Contact.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import liveCartRoutes from './routes/liveCart.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import serviceProductRoutes from './routes/service.js';
import bookingRoutes from './routes/bookings.js';
import brevoTestRoutes from './routes/brevoTest.js';
import ensureUserCustomerNumbers from './utils/ensureUserCustomerNumbers.js';
import reviewRoutes from './routes/review.js';
import { startSettlementCron } from './cron/settlementCron.js';

const app = express();

/* =========================
   CORS CONFIG
========================= */

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://rentnpay-admin.vercel.app',
  'https://rentnpay.vercel.app',
  'http://rnp-admin.vercel.app',
  'https://rnp-website.vercel.app',
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean),
];

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);

    const raw = String(origin).trim();
    const lower = raw.toLowerCase();
    const isVercelApp = lower.endsWith('.vercel.app');

    if (allowedOrigins.includes(raw) || isVercelApp) {
      return cb(null, true);
    }

    return cb(new Error('Not allowed by CORS'));
  },

  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.static('uploads'));

/* =========================
   FAILSAFE CORS HEADERS
========================= */

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    const lower = String(origin).toLowerCase();

    const isAllowed =
      allowedOrigins.includes(origin) || lower.endsWith('.vercel.app');

    if (isAllowed) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    }
  }

  res.header(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );

  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

/* =========================
   HEALTH CHECK
========================= */

app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'rentpay-server',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   CONTACT ROUTES
========================= */
// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/live-cart', liveCartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/brevo-test', brevoTestRoutes);
app.use('/api/service-products', serviceProductRoutes);
app.use('/api/reviews', reviewRoutes);

app.use('/api/contact', contactRoutes);
app.use('/api', invoicePdfRoutes);

/* =========================
   ADMIN CONTACT TICKETS
========================= */

app.get('/api/admin/contact-tickets', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1,
    });

    const tickets = contacts.map((c) => ({
      _id: c._id,
      customerName: c.fullName,
      email: c.email,
      phone: c.phone,
      subject: c.subject,
      message: c.message,
      status: c.status || 'pending',
      createdAt: c.createdAt,
      source: 'user',
    }));

    res.json({
      success: true,
      tickets,
    });
  } catch (err) {
    console.error('Contact tickets error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact tickets',
    });
  }
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

/* =========================
   DB CONNECTION
========================= */

const mongoUri = process.env.MONGODB_URI?.trim();

if (!mongoUri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}

async function connectMongo() {
  const fallback = process.env.MONGODB_URI_FALLBACK?.trim();

  try {
    await mongoose.connect(mongoUri);

    return {
      uri: mongoUri,
      usedFallback: false,
    };
  } catch (err) {
    if (fallback && fallback !== mongoUri) {
      await mongoose.connect(fallback);

      return {
        uri: fallback,
        usedFallback: true,
      };
    }

    throw err;
  }
}

/* =========================
   START SERVER
========================= */

connectMongo()
  .then(async ({ usedFallback }) => {
    console.log(
      usedFallback ? 'MongoDB Connected (fallback)' : 'MongoDB Connected',
    );

    // try {
    //   await ensureUserCustomerNumbers();
    // } catch (e) {
    //   console.error('ensureUserCustomerNumbers:', e?.message || e);
    // }

    // const PORT = process.env.PORT || 5001;

    try {
      await ensureUserCustomerNumbers();
    } catch (e) {
      console.error('ensureUserCustomerNumbers:', e?.message || e);
    }

    // One-time cleanup: drop legacy settlements index if it still exists
    // One-time cleanup: drop legacy settlements index if it still exists
    try {
      const indexes = await mongoose.connection.db
        .collection('settlements')
        .indexes();
      const hasOldIndex = indexes.some(
        (i) => i.name === 'orderId_1_vendorId_1',
      );
      if (hasOldIndex) {
        await mongoose.connection.db
          .collection('settlements')
          .dropIndex('orderId_1_vendorId_1');
        console.log('Dropped legacy settlements index: orderId_1_vendorId_1');
      }
    } catch (e) {
      console.error('Settlement index cleanup skipped:', e?.message || e);
    }

    // try {
    //   startSettlementCron();
    //   console.log('Settlement auto-payout cron scheduled (Sun 10:00 AM)');
    // } catch (e) {
    //   console.error('Failed to start settlement cron:', e?.message || e);
    // }

    try {
      startSettlementCron();
      console.log(
        'Cron jobs scheduled: Settlement auto-payout (Sun 6:00 PM IST), Tenure expiry reminders (daily 9:00 AM IST)',
      );
    } catch (e) {
      console.error('Failed to start settlement cron:', e?.message || e);
    }

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })

  .catch((err) => {
    console.error('MongoDB connection error:', err);

    process.exit(1);
  });
