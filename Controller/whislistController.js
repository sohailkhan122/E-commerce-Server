const expressAsyncHandler = require("express-async-handler");
const Product = require("../models/productsModel");
const UserModel = require("../models/userModel");

// 🔹 Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id; // Middleware se
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await UserModel.findById(userId);

    // Check if product already in wishlist
    if (user.wishlist.find(item => item.productId.toString() === productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.wishlist.push({ productId });
    await user.save();

    const populatedUser = await user.populate("wishlist.productId");

    res.status(200).json({ wishlist: populatedUser.wishlist });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await UserModel.findById(userId);

    user.wishlist = user.wishlist.filter(
      item => item.productId.toString() !== productId
    );

    await user.save();

    const populatedUser = await user.populate("wishlist.productId");

    res.status(200).json({ wishlist: populatedUser.wishlist });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Get user wishlist
const getWishlist = expressAsyncHandler(async (req, res) => {
  const userId = req.user?.id; // req.user auth middleware se aayega

  if (!userId) {
    res.status(401);
    throw new Error("User not logged in");
  }

  // Get user's wishlist
  const user = await UserModel.findById(userId).select("wishlist");

  if (!user || !user.wishlist || user.wishlist.length === 0) {
    return res.json([]); // wishlist empty hai
  }

  // Extract product IDs from wishlist
  const wishlistProductIds = user.wishlist.map((item) => item.productId);

  // Fetch products that are in wishlist
  const products = await Product.find({ _id: { $in: wishlistProductIds } }).sort({ createdAt: -1 });

  // Map products and mark them as wishlisted
  const productsWithWishlist = products.map((product) => ({
    ...product.toObject(),
    isWishlisted: true
  }));

  res.json(productsWithWishlist);
});

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};