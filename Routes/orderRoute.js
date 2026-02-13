const express = require('express');
const { createOrder, getOrdersByUserId, removeProductDetail, fatchAllOrders, getOrderById, updateOrderStatus } = require('../Controller/orderController');

const router = express.Router();

router.post('/createOrder', createOrder);
router.get('/getOrdersByUserId/:userId', getOrdersByUserId);
router.delete('/removeProductDetail/:productDetailId/:orderId', removeProductDetail);
router.get('/fatchAllOrders', fatchAllOrders);
router.put('/updateOrderStatus/:orderId', updateOrderStatus);
router.get('/getOrderById/:orderId', getOrderById);

module.exports = router;