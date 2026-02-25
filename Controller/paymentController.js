const Stripe = require('stripe');
const CartItem = require('../models/cartModel');
const UserModel = require('../models/userModel');
const Product = require('../models/productsModel');
const Order = require('../models/orderModel');

const payment = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { sessionId } = req.params;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID missing' });
    }

    // 1️⃣ Verify Stripe Payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    // 2️⃣ Prevent Duplicate Order
    const existingOrder = await Order.findOne({ 'payment.transactionId': session.payment_intent });
    if (existingOrder) {
      return res.json({ success: true, message: 'Order already exists', order: existingOrder });
    }

    // 3️⃣ Get User
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 4️⃣ Get Cart
    const cart = await CartItem.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // 5️⃣ Build Order Products from Cart
    const orderProducts = [];
    for (let item of cart.products) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      orderProducts.push({
        productId: product._id,
        title: product.title,
        size: item.size,
        color: item.color,
        images: product.images || [],
        price: product.price,
        quantity: item.quantity,
        category: product.category,
        type: product.type,
      });
    }

    if (orderProducts.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid products found in cart' });
    }

    // 6️⃣ Create Order
    const order = await Order.create({
      userId,
      products: orderProducts,
      total: session.amount_total / 100,
      payment: {
        method: 'stripe',
        status: 'paid',
        transactionId: session.payment_intent,
        currency: session.currency?.toUpperCase(),
        paidAt: new Date(),
        email: session.customer_details?.email,
      },
      shippingAddress: {
        country: user.region,
        state: user.state,
        city: user.city,
        streetAddress: user.streetAddress,
        postalCode: user.postalCode,
        phone: user.phone,
      },
    });

    // 7️⃣ Clear Cart
    cart.products = [];
    await cart.save();

    return res.json({ success: true, message: 'Order created successfully', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

module.exports = payment;