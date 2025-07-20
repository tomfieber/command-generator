const express = require('express');
const router = express.Router();
const Command = require('../models/Command');

// PUT update command order - MUST be before /:id routes
router.put('/reorder', async (req, res) => {
  try {
    const { commands } = req.body; // Array of {id, order} objects
    
    if (!commands || commands.length === 0) {
      return res.status(400).json({ message: 'No commands provided for reordering' });
    }

    // Get the first command to determine category and phase
    const firstCommand = await Command.findById(commands[0].id).populate('category');
    if (!firstCommand) {
      return res.status(404).json({ message: 'Command not found' });
    }

    const categoryId = firstCommand.category._id;
    const phase = firstCommand.phase;

    // Update each command's order within the same category and phase
    const updatePromises = commands.map(({ id, order }) => 
      Command.findByIdAndUpdate(id, { order }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.json({ message: 'Commands reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all commands
router.get('/', async (req, res) => {
  try {
    const commands = await Command.find().populate('category').sort({ phase: 1, order: 1 });
    res.json(commands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET commands by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const commands = await Command.find({ category: req.params.categoryId }).populate('category');
    res.json(commands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET commands by phase
router.get('/phase/:phase', async (req, res) => {
  try {
    const commands = await Command.find({ phase: req.params.phase }).populate('category');
    res.json(commands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET commands with domain substitution
router.post('/generate', async (req, res) => {
  try {
    const { domain, categoryId, phase } = req.body;
    
    let query = {};
    if (categoryId) query.category = categoryId;
    if (phase) query.phase = phase;
    
    const commands = await Command.find(query).populate('category');
    
    // Replace domain placeholder with actual domain
    const generatedCommands = commands.map(cmd => ({
      ...cmd._doc,
      generatedCommand: cmd.command.replace(/\{domain\}/g, domain || 'example.com')
    }));
    
    res.json(generatedCommands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new command
router.post('/', async (req, res) => {
  const command = new Command({
    name: req.body.name,
    command: req.body.command,
    description: req.body.description,
    category: req.body.category,
    phase: req.body.phase,
    tags: req.body.tags
  });

  try {
    const newCommand = await command.save();
    const populatedCommand = await Command.findById(newCommand._id).populate('category');
    res.status(201).json(populatedCommand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update command
router.put('/:id', async (req, res) => {
  try {
    const command = await Command.findById(req.params.id);
    if (!command) {
      return res.status(404).json({ message: 'Command not found' });
    }

    command.name = req.body.name || command.name;
    command.command = req.body.command || command.command;
    command.description = req.body.description || command.description;
    command.category = req.body.category || command.category;
    command.phase = req.body.phase || command.phase;
    command.tags = req.body.tags || command.tags;

    const updatedCommand = await command.save();
    const populatedCommand = await Command.findById(updatedCommand._id).populate('category');
    res.json(populatedCommand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE command
router.delete('/:id', async (req, res) => {
  try {
    const command = await Command.findById(req.params.id);
    if (!command) {
      return res.status(404).json({ message: 'Command not found' });
    }

    await Command.findByIdAndDelete(req.params.id);
    res.json({ message: 'Command deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
