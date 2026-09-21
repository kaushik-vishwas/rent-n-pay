// import jwt from 'jsonwebtoken';
// import User from '../models/adminModel';

// export const protect = async (req, res, next) => {
//   let token;
//   if (req.headers.authorization?.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//   }
//   if (!token) {
//     return res.status(401).json({ message: 'Not authorized' });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select('-password');
//     if (!req.user) return res.status(401).json({ message: 'User not found' });
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Not authorized' });
//   }
// };

// export const admin = (req, res, next) => {
//   if (req.user?.role !== 'admin') {
//     return res.status(403).json({ message: 'Admin access required' });
//   }
//   next();
// };
import jwt from 'jsonwebtoken';
import User from '../models/userAuthModel.js';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    if (token.startsWith('Bearer ')) token = token.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id || decoded?.userId;
    const user = userId ? await User.findById(userId).select('-password') : null;
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    
    const token =
      req.cookies?.adminToken ||
      req.headers?.authorization?.replace("Bearer ", "");

  
      

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    console.log("Admin token:", token);

    // Token decode karo — ab _id milega, email nahi
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    const admin = await Admin.findById(decoded.adminId).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Admin not found",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin account is deactivated",
      });
    }

    // ✅ Ab req.admin._id milega — email nahi
    req.admin = admin;
    console.log(admin)
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};
