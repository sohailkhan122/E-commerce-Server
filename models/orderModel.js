const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'e_commerce_user', // use your User model
      required: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        title: { type: String, required: true },
        size: { type: String },
        color: { type: String },
        images: { type: [String] }, // must be array
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        category: { type: String },
        type: { type: String },
      },
    ],

    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },

    payment: {
      method: {
        type: String,
        enum: ['stripe', 'paypal', 'cash'],
        default: 'stripe',
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'paid',
      },
      transactionId: { type: String, required: true },
      currency: { type: String },
      paidAt: { type: Date },
      email: { type: String },
    },

    shippingAddress: {
      country: { type: String },
      state: { type: String },
      city: { type: String },
      streetAddress: { type: String },
      postalCode: { type: String },
      phone: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);