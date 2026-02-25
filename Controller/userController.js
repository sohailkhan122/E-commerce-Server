const UserModel = require("../models/userModel");
const RefreshToken = require("../models/refreshTokenModel");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const expressAsyncHandler = require("express-async-handler");


// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      lastname,
      region,
      streetadress,
      unit,
      city,
      state,
      postalcode,
      phone,
      deliveryinstruction,
      isAdmin,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      lastname,
      region,
      streetadress,
      unit,
      city,
      state,
      postalcode,
      phone,
      deliveryinstruction,
      isAdmin,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      isAdmin: user.isAdmin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= REFRESH TOKEN =================
const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

    const storedToken = await generateRefreshToken.findOne({ token: refreshToken });
    if (!storedToken) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Expired refresh token" });

      const user = await UserModel.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Rotate refresh token
      await RefreshToken.deleteOne({ token: refreshToken });

      const newRefreshToken = generateRefreshToken(user);
      const newAccessToken = generateAccessToken(user);

      await RefreshToken.create({
        user: user._id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ message: "Token refreshed" });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= LOGOUT =================
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= FORGOT PASSWORD =================
const forgotPasswordController = expressAsyncHandler(async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log(process.env.SENDGRID_API_KEY)
  const { email } = req.body;

  const normalizedEmail = email.trim().toLowerCase();
  const user = await UserModel.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = {
    to: user.email,
    from: process.env.EMAIL_FROM, // IMPORTANT: verified sender
    subject: "Password Reset Link",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 15 minutes.</p>
    `,
  };

  await sgMail.send(message);

  res.status(200).json({ message: "Reset link sent to email" });
});

// ================= RESET PASSWORD =================
const resetPasswordController = expressAsyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
});


// ================= GET USER BY ID =================
const getUserByIdController = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= UPDATE USER =================
const updateUserController = async (req, res) => {
  try {
    // req.user id protect middleware se aayegi
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    Object.assign(user, req.body); // body me jo fields hain unko update kar do
    await user.save();

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= GET ALL USERS =================
const getAllUsersController = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentUser = expressAsyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not found" });
  }

  res.status(200).json({
    success: true,
    user: req.user, // already password remove ho chuka hai
  });
});


module.exports = {
  registerUser,
  loginUser,
  refreshTokenController,
  logoutUser,
  forgotPasswordController,
  resetPasswordController,
  getUserByIdController,
  updateUserController,
  getAllUsersController,
  getCurrentUser
};