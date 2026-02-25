const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [wishlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Ensure one wishlist per user
wishlistSchema.index({ user: 1 }, { unique: true });

// ✅ Prevent duplicate products inside same wishlist
wishlistSchema.methods.addProduct = function (productId) {
  const alreadyExists = this.items.some(
    (item) => item.product.toString() === productId.toString()
  );

  if (!alreadyExists) {
    this.items.push({ product: productId });
  }

  return this.save();
};

wishlistSchema.methods.removeProduct = function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  return this.save();
};

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;