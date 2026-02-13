const CartItem = require('../models/cartModel');

const createCartItem = async (req, res) => {
    try {
        const { productId, quantity, size, color, userId } = req.body;

        if (size === null || size === undefined) {
            return res.status(400).json({ message: "Please provide a size" });
        }

        if (color === null || color === undefined) {
            return res.status(400).json({ message: "Please provide a color" });
        }

        let cartItem = await CartItem.findOne({ userId });
        if (!cartItem) {
            cartItem = new CartItem({
                products: [{ productId, quantity, size, color }],
                userId
            });
        } else {
            const existingProductIndex = cartItem.products.findIndex(item => String(item.productId) === String(productId));
            console.log(existingProductIndex);
            if (existingProductIndex !== -1) {
                cartItem.products[existingProductIndex].quantity += 1;
            } else {
                cartItem.products.push({ productId, quantity, size, color });
            }
        }

        await cartItem.save();

        res.status(201).json({ message: 'Cart item added/updated successfully', cartItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getCartItem = async (req, res) => {
    try {
        const { userId } = req.params;

        const cartItem = await CartItem.findOne({ userId });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart not found for this user' });
        }

        res.status(200).json({ cartItem });
    } catch (error) {
        console.error('Error retrieving cart items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteProductFromCart = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.params;

    try {

        const cartItem = await CartItem.findOne({ userId });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        cartItem.products = cartItem.products.filter(product => product.productId.toString() !== id);

        await cartItem.save();

        return res.status(200).json({ message: 'Product removed from cart successfully' });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const updateQuantity = async (req, res) => {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    try {
        let cartItem = await CartItem.findOne({ userId });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        const existingProductIndex = cartItem.products.findIndex(item => String(item.productId) === String(productId));

        if (existingProductIndex !== -1) {
            cartItem.products[existingProductIndex].quantity = quantity;
            await cartItem.save();
            return res.json({ success: true, cartItem });
        }

        res.status(404).json({ success: false, message: 'Product not found in cart' });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ success: false, message: 'Failed to update quantity' });
    }
};



module.exports = {
    createCartItem,
    getCartItem,
    deleteProductFromCart,
    updateQuantity
};
