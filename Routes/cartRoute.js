const express = require('express');
const router = express.Router();
const { createCartItem, getCartItem, deleteProductFromCart, updateQuantity } = require('../Controller/cartController');
const { protect } = require('../middleware/authMiddleware');

router.post('/addToCart', protect, createCartItem);
router.get("/getcart", protect, getCartItem);
router.delete("/delete/:productId", protect, deleteProductFromCart);
router.put("/updatequantity", protect, updateQuantity);

module.exports = router;