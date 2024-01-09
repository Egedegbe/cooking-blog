const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'This field is required.'
  },

  title: {
    type: String,
    required: 'This field is required.'
  },
  description: {
    type: String,
    required: 'This field is required.'
  },
  email: {
    type: String,
    required: 'This field is required.'
  },
  steps: {
    type: String,
    required: 'This field is required.'
  },
  ingredients: {
    type: Array,
    required: 'This field is required.'
  },
  category: {
    type: String,
    // enum: ['Thai', 'American', 'Chinese', 'Mexican', 'Indian'],
    required: 'This field is required.'
  },
  image: {
    type: String,
    required: 'This field is required.'
  },
  userId: {
    type: String, // Change this to the type that represents a user ID in your system
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending',
  },
});

recipeSchema.index({ name: 'text', description: 'text' });
// WildCard Indexing
//recipeSchema.index({ "$**" : 'text' });

module.exports = mongoose.model('recipe', recipeSchema);