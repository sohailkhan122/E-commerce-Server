const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

exports.protect = async (req, res, next) => {
  try {
    // 1️⃣ Token cookie se nikal lo
    const token = req.cookies.accessToken;
    // console.log("Token from cookie:", token);
    if (!token) {
      // return res.status(401).json({ message: "Not authorized, no token" });
      return next();
    }

    // 2️⃣ Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ User fetch karo aur password exclude karo
    const user = await UserModel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // 4️⃣ Middleware me attach karo
    req.user = user;

    // 5️⃣ Next middleware ya controller call
    next();
  } catch (error) {
    console.error("Protect Middleware Error:", error.message);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};
