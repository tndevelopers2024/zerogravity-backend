// controllers/cartController.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        return res.json(cart || { user: req.user._id, items: [] });
    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, selectedSize, selectedFormat, customizationImages, ealbumCustomization } = req.body;

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ message: "Product not found" });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingIndex = cart.items.findIndex(
            item =>
                item.product.toString() === productId &&
                (item.selectedSize?.name || "") === (selectedSize?.name || "") &&
                (item.selectedFormat || "") === (selectedFormat || "") &&
                !ealbumCustomization // Don't merge if it has e-album customization, treat as unique
        );

        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                selectedSize,
                selectedFormat,
                customizationImages: customizationImages || [],
                ealbumCustomization
            });
        }

        await cart.save();

        const populatedCart = await cart.populate("items.product");

        return res.status(200).json(populatedCart);
    } catch (error) {
        console.error("Add to cart error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.id(itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        if (quantity <= 0) {
            cart.items.pull(itemId);
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        const populatedCart = await cart.populate("items.product");

        return res.json(populatedCart);
    } catch (error) {
        console.error("Update cart item error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items.pull(itemId);
        await cart.save();
        const populatedCart = await cart.populate("items.product");

        return res.json(populatedCart);
    } catch (error) {
        console.error("Remove cart item error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        return res.json({ message: "Cart cleared" });
    } catch (error) {
        console.error("Clear cart error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
