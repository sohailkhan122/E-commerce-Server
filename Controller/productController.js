const Product = require('../models/productsModel');

const createProduct = async (req, res) => {
    try {
        const { title, productName, images, price, category, type } = req.body;

        const product = new Product({ title, productName, images, price, category, type });
        await product.save();
        res.status(201).json(product);
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: error.message });
    }
};


const editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, productName, images, price, category, type } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.title = title;
        product.productName = productName;
        product.images = images;
        product.price = price;
        product.category = category;
        product.type = type;

        await product.save();

        res.status(200).json(product);
    } catch (error) {
        console.error('Error editing product:', error);
        res.status(500).json({ message: error.message });
    }
};

const getSingleProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProducts = async (req, res) => {
    try {
        const productId = req.params.productId;

        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
};

const productGetByName = async (req, res) => {
    const categoryName = req.params.name;

    try {
        const products = await Product.find({ category: { $regex: categoryName, $options: 'i' } });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products by name:', error);
        res.status(500).json({ message: 'Failed to fetch products by name' });
    }
};

const getProductsByIds = async (req, res) => {
    try {
        const { ids } = req.body; // frontend se array ayega

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "IDs array is required" });
        }

        const products = await Product.find({
            _id: { $in: ids }
        });

        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products by IDs:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    deleteProducts,
    productGetByName,
    editProduct,
    getSingleProduct,
    getProductsByIds
};