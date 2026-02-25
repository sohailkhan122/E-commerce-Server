const express = require('express')
const { addToWishlist, getWishlist, removeFromWishlist } = require('../Controller/whislistController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/add", protect, addToWishlist);
router.get("/", protect, getWishlist);
router.delete("/remove", protect, removeFromWishlist);

module.exports = router;    