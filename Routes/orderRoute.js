const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getUserOrders, updateOrderStatus, getAllOrders } = require('../Controller/orderController');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/getuserorder', protect, getUserOrders);
router.get('/getallorders', protect, admin, getAllOrders)
router.put('/updateOrderStatus/:orderId', protect, admin, updateOrderStatus);

module.exports = router;