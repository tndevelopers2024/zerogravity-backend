// controllers/categoryController.js
const Category = require("../models/category");

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        return res.json(categories);
    } catch (error) {
        console.error("Get categories error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getSingleCategory = async (req, res) => {
    try {
        const cat = await Category.findById(req.params.id);
        if (!cat) return res.status(404).json({ message: "Category not found" });
        return res.json(cat);
    } catch (error) {
        console.error("Get single category error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, slug, image } = req.body;
        const exists = await Category.findOne({ slug });
        if (exists) return res.status(400).json({ message: "Slug already exists" });

        const cat = await Category.create({ name, slug, image });
        return res.status(201).json(cat);
    } catch (error) {
        console.error("Create category error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cat) return res.status(404).json({ message: "Category not found" });
        return res.json(cat);
    } catch (error) {
        console.error("Update category error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const cat = await Category.findById(req.params.id);
        if (!cat) return res.status(404).json({ message: "Category not found" });

        await cat.deleteOne();
        return res.json({ message: "Category deleted" });
    } catch (error) {
        console.error("Delete category error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
