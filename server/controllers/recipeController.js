require("../models/database");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const { roles } = require("../routes/constants");
const comments = require("../models/comment");
const moment = require('moment')
/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({ status: "approved" })
      .sort({ _id: -1 })
      .limit(limitNumber);
    const food = { latest };

    res.render("index", { title: "Cooking Blog - Home", categories, food });
  } catch (err) {
    console.log(err);
  }
};

/**
 * GET /categories
 * Categories
 */
exports.exploreCategories = async (req, res) => {
  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render("categories", {
      title: "Cooking Blog - Categoreis",
      categories,
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * GET /categories/:id
 * Categories By Id
 */
exports.exploreCategoriesById = async (req, res) => {
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({
      category: categoryId,
      status: "approved",
    }).limit(limitNumber);

    res.render("categories_content", {
      title: "Cooking Blog - Categoreis",
      categoryById,
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * GET /recipe/:id
 * Recipe
 */
exports.exploreRecipe = async (req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    const Comments = await comments.find({recipeID:recipeId})
    const CommentCount = await comments.find({recipeID:recipeId}).countDocuments()
   
    res.render("recipe", { title: "Cooking Blog - Recipe", recipe , Comments,CommentCount});
  } catch (err) {
    console.log(err);
  }
};

/**
 * POST /search
 * Search
 */
exports.searchRecipe = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find({
      $text: { $search: searchTerm, $diacriticSensitive: true },
    });
    res.render("search", { title: "Cooking Blog - Search", recipe });
  } catch (err) {
    console.log(err);
  }
};

/**
 * GET /explore-latest
 * Explplore Latest
 */
exports.exploreLatest = async (req, res) => {
  try {
    const limitNumber = 20;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render("explore-latest", {
      title: "Cooking Blog - Explore Latest",
      recipe,
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * GET /explore-random
 * Explore Random as JSON
 */
exports.exploreRandom = async (req, res) => {
  try {
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();
    res.render("explore-random", {
      title: "Cooking Blog - Explore Latest",
      recipe,
    });
  } catch (err) {
    console.log(err);
  }
};

const date = moment().format("dddd, MMMM Do YYYY")

const time = moment().format('h:mm:ss a')

console.log(`Author ON ${date} AT ${time}`)