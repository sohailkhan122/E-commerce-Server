const express = require('express')

const { addToWishlist, getWishlist, removeFromWishlist } = require('../Controller/whislistController')
const Router = express.Router();


Router.post("/add",addToWishlist);
Router.post("/remove",removeFromWishlist);
Router.get("/:userId",getWishlist);

module.exports = Router;    