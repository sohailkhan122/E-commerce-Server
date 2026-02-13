const UserModel = require('../models/userModel')
const expressAsyncHandler = require("express-async-handler");
const generateToken = require('../Config/generateToken');
const crypto = require("crypto"); // ✅ ADDED (token generate karne ke liye) // ✅ ADDED (email bhejne ke liye)
const sgMail = require("@sendgrid/mail");

const loginController = expressAsyncHandler(async (req, res) => {
  console.log(req.body)
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please fill in all the fields" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const user = await UserModel.findOne({ email: normalizedEmail });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json(user);
  } else {
    res.status(401).json({ error: "Invalid email or Password" });
  }
});


const registerController = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(40).json({ error: "All fields are required" })
  }
  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(normalizedEmail)) {
    res.status(400).json({ error: "Invalid email format" })
  }

  const userExist = await UserModel.findOne({ email: normalizedEmail });
  if (userExist) {
    res.status(400).json({ error: "User already exists" });
  }

  const user = new UserModel({ name, email: normalizedEmail, password });
  await user.save();

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ error: "Registration failed" });
  }
});

// ================================
// FORGOT PASSWORD CONTROLLER
// ================================

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
    from: "m.sohailaqeel@gmail.com", // IMPORTANT: verified sender
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


// ================================
// RESET PASSWORD CONTROLLER
// ================================
const resetPasswordController = expressAsyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token to compare with DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with valid token and not expired
  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  // ✅ Just assign new password (model will hash it)
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});


const updateUser = async (req, res) => {
  const {
    name,
    lastname,
    region,
    companyname,
    streetadress,
    unit,
    city,
    state,
    phone,
    postalcode,
    deliveryinstruction,
  } = req.body;
  console.log('Received body:', req.body);
  console.log('Received params:', req.params);
  const { userId } = req.params

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.name = name;
    user.lastname = lastname;
    user.region = region;
    user.companyname = companyname;
    user.streetadress = streetadress;
    user.unit = unit;
    user.city = city;
    user.state = state;
    user.phone = phone;
    user.postalcode = postalcode;
    user.deliveryinstruction = deliveryinstruction;

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Error updating user: ' + error.message });
  }
};

const getUserByIdController = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await UserModel.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      name: user.name,
      lastname: user.lastname,
      region: user.region,
      companyname: user.companyname,
      streetadress: user.streetadress,
      unit: user.unit,
      city: user.city,
      state: user.state,
      phone: user.phone,
      postalcode: user.postalcode,
      deliveryinstruction: user.deliveryinstruction,
    });
  } catch (error) {
    console.error('Error retrieving user by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};



module.exports = { registerController, loginController, updateUser, getUserByIdController, getAllUsers, forgotPasswordController, resetPasswordController }