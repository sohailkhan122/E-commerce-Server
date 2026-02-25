const Product = require("../models/productsModel");
const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");

// ✅ Allowed categories and types from model
const allowedCategories = ["Men", "Women", "Shoes", "Accessories", "NewArrivals", "InTheLimelight"];
const allowedTypes = ["Tops", "PrintedT-Shirt", "PlainT-Shirt", "Kurti", "Jeans", "Trousers", "Shorts", "Skirts", "Dresses", "Jumpsuits", "Sneakers", "Boots", "Sandals", "Heels", "Bags", "Watches", "Jewelry"];

// ✅ CREATE PRODUCT (Admin only)
const createProduct = asyncHandler(async (req, res) => {
    const { title, productName, images, price, category, type, stock } = req.body;

    // Required fields
    if (!title || !productName || !price || !category || !type) {
        res.status(400);
        throw new Error("Required fields missing");
    }

    // Enum validation
    if (!allowedCategories.includes(category)) {
        res.status(400);
        throw new Error(`Category must be one of: ${allowedCategories.join(", ")}`);
    }
    if (!allowedTypes.includes(type)) {
        res.status(400);
        throw new Error(`Type must be one of: ${allowedTypes.join(", ")}`);
    }

    const product = new Product({
        title,
        productName,
        images: images && images.length > 0 ? images : ["/images/default-product.jpg"],
        price,
        category,
        type,
        stock: stock || 0,
        createdBy: req.user._id, // ✅ Admin ID from JWT middleware
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// ✅ GET ALL PRODUCTS
const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 }); // latest first
    res.json(products);
});

// ✅ GET PRODUCT BY ID
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }
    res.json(product);
});

// ✅ UPDATE PRODUCT (Admin only)
const updateProduct = asyncHandler(async (req, res) => {
    const { title, productName, images, price, category, type, stock, isActive } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Update fields only if provided
    if (title) product.title = title;
    if (productName) product.productName = productName;
    if (images && images.length > 0) product.images = images;
    if (price !== undefined) product.price = price;

    if (category) {
        if (!allowedCategories.includes(category)) {
            res.status(400);
            throw new Error(`Category must be one of: ${allowedCategories.join(", ")}`);
        }
        product.category = category;
    }

    if (type) {
        if (!allowedTypes.includes(type)) {
            res.status(400);
            throw new Error(`Type must be one of: ${allowedTypes.join(", ")}`);
        }
        product.type = type;
    }

    if (stock !== undefined) product.stock = stock;
    if (isActive !== undefined) product.isActive = isActive;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
});

// ✅ DELETE PRODUCT (Admin only)
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // 🔹 Replace remove() with deleteOne()
    await product.deleteOne();

    res.json({ message: "Product removed successfully" });
});

const getProductsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;

    // Validate category
    if (!allowedCategories.includes(category)) {
        res.status(400);
        throw new Error(`Category must be one of: ${allowedCategories.join(", ")}`);
    }

    // Fetch products in this category
    const products = await Product.find({ category }).sort({ createdAt: -1 });

    if (!products || products.length === 0) {
        res.status(404);
        throw new Error("No products found for this category");
    }

    // Check if user is logged in
    const userId = req.user?.id; // req.user should be set by auth middleware

    if (userId) {
        // Get user's wishlist
        const user = await UserModel.findById(userId).select("wishlist");
        const wishlistIds = user.wishlist.map((item) => item.productId.toString());

        // Map products and add temporary field
        const productsWithWishlist = products.map((product) => {
            const isWishlisted = wishlistIds.includes(product._id.toString());
            return { ...product.toObject(), isWishlisted };
        });

        return res.json(productsWithWishlist);
    }

    // If user not logged in, just send products normally
    res.json(products);
});

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory
};