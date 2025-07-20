const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  command: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  phase: {
    type: String,
    required: true,
    enum: ['Reconnaissance', 'Scanning', 'Enumeration', 'Exploitation', 'Post-Exploitation', 'Reporting']
  },
  tags: [{
    type: String
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Command', commandSchema);
