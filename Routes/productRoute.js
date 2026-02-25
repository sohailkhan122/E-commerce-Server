const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getProductsByCategory } = require('../Controller/productController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get("/getAllProducts", getAllProducts);
router.get("/getProductById/:id", getProductById);
router.post("/createProduct", protect, admin, createProduct);
router.put("/updateProduct/:id", protect, admin, updateProduct);
router.delete("/deleteProducts/:id", protect, admin, deleteProduct);
router.get("/getProductsByCategory/:category", protect, getProductsByCategory);

module.exports = router;
