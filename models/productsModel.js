const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  images: {
    type: String,

  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
