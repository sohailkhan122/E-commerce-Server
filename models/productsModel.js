const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },

    images: {
      type: [String], // ✅ Array of image URLs
      default: ["/images/default-product.jpg"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be positive"],
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: ["Men", "Women", "Shoes", "Accessories","NewArrivals", "InTheLimelight"],
    },

    type: {
      type: String,
      required: [true, "Product type is required"],
      enum: ["Tops", "PrintedT-Shirt", "PlainT-Shirt", "Kurti","Jeans", "Trousers", "Shorts", "Skirts", "Dresses", "Jumpsuits","Sneakers", "Boots", "Sandals", "Heels","Bags", "Watches", "Jewelry"],
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Slug from productName
productSchema.pre("save", function (next) {
  if (this.isModified("productName")) {
    this.slug = this.productName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }
  next();
});

productSchema.index({ title: "text", productName: "text", category: 1, type: 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
