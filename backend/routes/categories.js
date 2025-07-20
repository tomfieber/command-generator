const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory')
      .sort({ isDefault: -1, order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET categories by type
router.get('/type/:type', async (req, res) => {
  try {
    const categories = await Category.find({ type: req.params.type });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new category
router.post('/', async (req, res) => {
  try {
    // Get the highest order number for non-default categories
    const maxOrder = await Category.findOne({ isDefault: false })
      .sort({ order: -1 })
      .select('order');
    
    const nextOrder = maxOrder ? maxOrder.order + 1 : 100; // Start custom categories at 100

    const category = new Category({
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      order: nextOrder,
      isDefault: false,
      parentCategory: req.body.parentCategory || null
    });

    const newCategory = await category.save();
    await newCategory.populate('parentCategory');
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT reorder categories
router.put('/reorder', async (req, res) => {
  try {
    const { categories } = req.body; // Array of {id, order} objects
    
    if (!categories || categories.length === 0) {
      return res.status(400).json({ message: 'No categories provided for reordering' });
    }

    // Update each category's order
    const updatePromises = categories.map(({ id, order }) => 
      Category.findByIdAndUpdate(id, { order }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = req.body.name || category.name;
    category.type = req.body.type || category.type;
    category.description = req.body.description || category.description;
    category.order = req.body.order !== undefined ? req.body.order : category.order;
    category.parentCategory = req.body.parentCategory !== undefined ? req.body.parentCategory : category.parentCategory;

    const updatedCategory = await category.save();
    await updatedCategory.populate('parentCategory');
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    const Command = require('../models/Command');
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if there are any commands using this category
    const commandCount = await Command.countDocuments({ category: req.params.id });
    if (commandCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It is being used by ${commandCount} command(s). Please delete or reassign the commands first.` 
      });
    }

    // Check for subcategories
    const subcategoryCount = await Category.countDocuments({ parentCategory: req.params.id });
    if (subcategoryCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${subcategoryCount} subcategory(ies). Please delete the subcategories first.` 
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
