const Category = require('../models/Category');
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
