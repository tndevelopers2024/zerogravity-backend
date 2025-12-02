// controllers/productController.js
const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
    try {
        const { type, category, search, page = 1, limit = 20 } = req.query;
        const query = { isActive: true };

        if (type) query.type = type;
        if (category) query.category = category;
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
            Product.countDocuments(query)
        ]);

        return res.json({
            data: products,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get products error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product || !product.isActive) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.json(product);
    } catch (error) {
        console.error("Get product error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        return res.status(201).json(product);
    } catch (error) {
        console.error("Create product error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!product) return res.status(404).json({ message: "Product not found" });
        return res.json(product);
    } catch (error) {
        console.error("Update product error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.isActive = false;
        await product.save();

        return res.json({ message: "Product archived" });
    } catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
