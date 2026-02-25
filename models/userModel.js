const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  region: { type: String },
  streetadress: { type: String, default: null },
  unit: { type: String },
  city: { type: String },
  state: { type: String },
  postalcode: { type: String },
  phone: { type: String },
  deliveryinstruction: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  isAdmin: { type: Boolean, default: false, },
  wishlist: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      addedAt: { type: Date, default: Date.now } // optional
    }
  ]
}, { timestamps: true });

// 🔐 Password hashing before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Password match method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model("e_commerce_user", userSchema);

module.exports = UserModel;
