const express = require('express');
const router = express.Router();
const { createCartItem, getCartItem, deleteProductFromCart, updateQuantity } = require('../Controller/cartController');

router.post('/addToCart', createCartItem);
router.get('/getCartItem/:userId', getCartItem);
router.delete('/deleteCartProducts/:id/:userId', deleteProductFromCart);
router.put('/updatequantiity/:userId', updateQuantity);

module.exports = router;