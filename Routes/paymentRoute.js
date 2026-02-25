const express = require('express');
const payment = require('../Controller/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/get-payment/:sessionId', protect, payment);


module.exports = router;
