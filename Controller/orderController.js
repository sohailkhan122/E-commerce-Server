const CartItem = require("../models/cartModel");
const Order = require("../models/orderModel");

const createOrder = async (req, res) => {
  try {
    const { userId, productDetails, total, paymentDetails } = req.body;

    const order = new Order({
      userId,
      productDetails,
      total,
      paymentDetails
    });

    await order.save();

    const cartItem = await CartItem.findOne({ userId });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    productDetails.forEach(async (product) => {
      const productId = product.productId;
      cartItem.products = cartItem.products.filter(item => item.productId.toString() !== productId.toString());
    });

    await cartItem.save();

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the user ID' });
    }
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders by user ID:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const removeProductDetail = async (req, res) => {
  const { orderId, productDetailId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const index = order.productDetails.findIndex(detail => detail._id.toString() === productDetailId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product detail not found in the order' });
    }

    const removedProductPrice = order.productDetails[index].price;

    order.productDetails.splice(index, 1);
    let newTotal = order.total - removedProductPrice;
    order.total = newTotal;

    await order.save();

    if (order.productDetails.length === 0) {
      await Order.findByIdAndDelete(orderId);
      return res.json({ success: true, message: 'Order deleted successfully' });
    }

    return res.json({ success: true, message: 'Product detail removed successfully', order });
  } catch (error) {
    console.error('Error removing product detail:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove product detail' });
  }
};

const fatchAllOrders = async (req, res) => {
  try {
    const products = await Order.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getOrderById = async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};


const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  createOrder,
  getOrdersByUserId,
  removeProductDetail,
  fatchAllOrders,
  getOrderById,
  updateOrderStatus
};
