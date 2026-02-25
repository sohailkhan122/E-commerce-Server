const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "e_commerce_user", required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

const RefreshToken = mongoose.model("refresh_tokens", refreshTokenSchema);
module.exports = RefreshToken;
