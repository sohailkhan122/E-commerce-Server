// controllers/orderController.js
const orderModel = require('../models/orderModel');

// Get orders for logged-in user

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getUserOrders = async (req, res) => {
  try {
    // JWT middleware se userId mil rahi hai
    const userId = req.user._id;

    // Orders find karo jisme userId match ho
    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No orders found for this user',
      });
    }

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ✅ Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params; // order id
    const { status } = req.body;

    // ✅ Allowed statuses
    const allowedStatus = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    // ✅ Find order
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // ✅ Update status
    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
module.exports = {
  getUserOrders,
  updateOrderStatus,
  getAllOrders
};