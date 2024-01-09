const mongoose = require("mongoose");
const Recipe = require("./Recipe");

const commentSchema = new mongoose.Schema({
  commentText: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  recipeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Recipe,
  },
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
