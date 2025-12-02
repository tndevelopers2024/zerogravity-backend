// controllers/orderController.js
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Download = require("../models/Download");

exports.placeOrder = async (req, res) => {
    try {
        const { deliveryAddress, paymentMethod, notes } = req.body;

        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let totalAmount = 0;
        const items = cart.items.map((item) => {
            const product = item.product;
            let price = product.price;

            if (item.selectedSize?.price) {
                price = item.selectedSize.price;
            }

            const subtotal = price * item.quantity;
            totalAmount += subtotal;

            const downloadLink =
                product.isDigital && product.digitalDownloadUrl
                    ? product.digitalDownloadUrl
                    : null;

            return {
                product: product._id,
                name: product.name,
                image: product.coverImage,
                quantity: item.quantity,
                price,
                selectedSize: item.selectedSize,
                selectedFormat: item.selectedFormat,
                customizationImages: item.customizationImages,
                ealbumCustomization: item.ealbumCustomization,
                subtotal,
                downloadLink
            };
        });

        const order = await Order.create({
            user: req.user._id,
            items,
            totalAmount,
            deliveryAddress,
            paymentMethod,
            notes,
            paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
            status: "pending"
        });

        // Create download licenses for digital products
        const digitalItems = items.filter((i) => i.downloadLink);
        if (digitalItems.length > 0) {
            for (const d of digitalItems) {
                await Download.create({
                    user: req.user._id,
                    product: d.product,
                    orderId: order._id,
                    downloadUrl: d.downloadLink
                });
            }
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        return res.status(201).json({ message: "Order placed", order });
    } catch (error) {
        console.error("Place order error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate("items.product");
        return res.json(orders);
    } catch (error) {
        console.error("Get my orders error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.product")
            .populate("user", "firstName lastName email phone");

        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to view this order" });
        }

        return res.json(order);
    } catch (error) {
        console.error("Get order error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Admin: all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("user", "firstName lastName email phone")
            .populate("items.product");
        return res.json(orders);
    } catch (error) {
        console.error("Get all orders error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Admin: update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus, trackingNumber } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: "Order not found" });

        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;

        await order.save();

        return res.json({ message: "Order updated", order });
    } catch (error) {
        console.error("Update order error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
