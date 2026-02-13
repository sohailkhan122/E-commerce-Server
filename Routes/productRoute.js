const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, deleteProducts, productGetByName, editProduct, getSingleProduct, getProductsByIds } = require('../Controller/productController');

router.post('/createProduct', createProduct);
router.get('/getAllProducts', getAllProducts);
router.delete('/deleteProducts/:productId', deleteProducts);
router.get('/productGetByName/:name', productGetByName);
router.put('/editProduct/:id', editProduct);
router.get('/getSingleProduct/:id', getSingleProduct);
router.post('/getProductsByIds', getProductsByIds);

module.exports = router;
