const CartItem = require('../models/cartModel');

// ======================
// Add or update cart item
// ======================
const createCartItem = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!size) return res.status(400).json({ message: "Please provide a size" });
    if (!color) return res.status(400).json({ message: "Please provide a color" });

    let qty = Number(quantity);
    if (isNaN(qty) || qty < 1) qty = 1;

    const userId = req.user._id; // Middleware se userId

    let cartItem = await CartItem.findOne({ userId });

    if (!cartItem) {
      cartItem = new CartItem({
        userId,
        products: [{ productId, quantity: qty, size, color }],
      });
    } else {
      const existingProductIndex = cartItem.products.findIndex(
        (item) =>
          String(item.productId) === String(productId) &&
          item.size === size &&
          item.color === color
      );

      if (existingProductIndex !== -1) {
        cartItem.products[existingProductIndex].quantity += qty;
      } else {
        cartItem.products.push({ productId, quantity: qty, size, color });
      }
    }

    await cartItem.save();
    res.status(201).json({ message: "Cart item added/updated successfully", cartItem });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ======================
// Get cart for logged-in user
// ======================
const getCartItem = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized - Please login" });
    }

    const userId = req.user._id;

    const cartItem = await CartItem
      .findOne({ userId })
      .populate("products.productId");

    if (!cartItem) {
      return res.status(404).json({ message: "Cart not found for this user" });
    }

    res.status(200).json({ cartItem });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ======================
// Delete product from cart
// ======================
const deleteProductFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cartItem = await CartItem.findOne({ userId });
    if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });

    cartItem.products = cartItem.products.filter(p => String(p.productId) !== String(productId));

    await cartItem.save();
    return res.status(200).json({ message: 'Product removed from cart successfully', cartItem });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ======================
// Update quantity of a product
// ======================
const updateQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 1) return res.status(400).json({ message: 'Invalid quantity' });

    const cartItem = await CartItem.findOne({ userId });
    if (!cartItem) return res.status(404).json({ message: 'Cart not found' });

    const productIndex = cartItem.products.findIndex(item => String(item.productId) === String(productId));
    if (productIndex === -1) return res.status(404).json({ message: 'Product not found in cart' });

    cartItem.products[productIndex].quantity = qty;
    await cartItem.save();

    res.status(200).json({ message: 'Quantity updated successfully', cartItem });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createCartItem,
  getCartItem,
  deleteProductFromCart,
  updateQuantity
};
