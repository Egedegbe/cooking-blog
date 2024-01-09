const router = require("express").Router();
const User = require("../models/user.model");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const connectEnsure = require("connect-ensure-login");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");
const Comment = require('../models/comment')
// const User = require("../models/user.model");
const mongoose = require("mongoose");

router.get(
  "/login",
  connectEnsure.ensureLoggedOut({ redirectTo: "/" }),
  async (req, res) => {
    res.render("login", { title: "login" });
  }
);
router.post(
  "/login",
  connectEnsure.ensureLoggedOut({ redirectTo: "/" }),
  passport.authenticate("local", {
    // successRedirect:'/',
    failureRedirect: "/auth/login",
    successReturnToOrRedirect: "/",
    failureFlash: true,
  })
);

router.get(
  "/register",
  connectEnsure.ensureLoggedOut({ redirectTo: "/" }),
  async (req, res) => {
    const messages = req.flash();
    res.locals.messages = messages;
    res.render("register", { title: "Register", messages });
  }
);

router.post(
  "/register",
  connectEnsure.ensureLoggedOut({ redirectTo: "/" }),
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Email must be a valid email")
      .normalizeEmail()
      .toLowerCase(),
    body("password")
      .trim()
      .isLength(2)
      .withMessage("Password length short, Min 2 char required"),
    body("password2").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password do not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash("error", error.msg);
        });
        res.render("register", {
          email: req.body.email,
          messages: req.flash(),
        });
        return;
      }
      const { email } = req.body;
      const doesExist = await User.findOne({ email });
      if (doesExist) {
        res.redirect("/auth/register");
        return;
      }
      const user = new User(req.body);
      await user.save();
      req.flash(
        "success",
        `${user.email} registered successfully, you can now login`
      );
      res.redirect("/auth/login");
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/logout",
  connectEnsure.ensureLoggedIn({ redirectTo: "/" }),
  async (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  }
);

router.get(
  "/submit-recipe",
  connectEnsure.ensureLoggedIn({ redirectTo: "/auth/login" }),
  async (req, res) => {
    try {
      const userEmail = req.user.email;
      const categories = await Category.find();

      res.render("submit-recipe", {
        title: "Cooking Blog - Submit Recipe",
        userEmail,
        categories,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

router.post(
  "/submit-post",
  connectEnsure.ensureLoggedIn({ redirectTo: "/auth/login" }),
  async (req, res) => {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
      req.flash("error", "Upload an Image");
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;
      uploadPath =
        require("path").resolve("./") + "/public/uploads/" + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
    try {
      const user = req.user.id;
      const userEmail = req.user.email;
      const newRecipe = new Recipe({
        name: req.body.name,
        description: req.body.description,
        title: req.body.title,
        steps: req.body.steps,
        email: userEmail,
        ingredients: req.body.ingredients,
        category: req.body.category,
        image: newImageName,
        userId: user,
        status: "pending",
      });

      await newRecipe.save();

      req.flash("success", `Recipe Sent to Admin for Review`);
      res.redirect("back");
    } catch (error) {
      // res.json(error);
      // req.flash("error", error);
      console.log(error);
      res.redirect("/auth/submit-recipe");
    }
  }
);

router.get(
  "/edit_recipe/:id",
  connectEnsure.ensureLoggedIn({ redirectTo: "/auth/login" }),
  async (req, res) => {
    try {
      const id = req.params.id;
      const editPost = await Recipe.findById(id);
      const categories = await Category.find();
      res.render("edit_recipe", { title: "edit_post", editPost, categories });

      // console.log(editPost)
    } catch (err) {
      console.log(err);
    }
  }
);
router.put(
  "/editrecipe/:id",
  connectEnsure.ensureLoggedIn({ redirectTo: "/auth/login" }),
  async (req, res) => {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("No Files where uploaded.");
    } else {
      imageUploadFile = req.files.image;
      newImageName = imageUploadFile.name;

      uploadPath =
        require("path").resolve("./") + "/public/uploads/" + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.satus(500).send(err);
      });
      try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          res.redirect("back");
          return;
        }
        const toBEditedPost = await Recipe.findByIdAndUpdate(id);
        toBEditedPost.name = req.body.name;
        toBEditedPost.description = req.body.description;
        toBEditedPost.email = req.body.email;
        toBEditedPost.ingredients = req.body.ingredients;
        toBEditedPost.category = req.body.category;
        toBEditedPost.title = req.body.title;
        toBEditedPost.steps = req.body.steps;
        toBEditedPost.image = newImageName;
        await toBEditedPost.save();
        res.redirect("/");
        console.log("updated");
      } catch (err) {
        if (err) return res.status(500).send(err);
      }
    }
  }
);

router.delete(
  "/deleteRecipe/:id",
  connectEnsure.ensureLoggedIn({ redirectTo: "/auth/login" }),
  async (req, res) => {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.redirect("back");
        return;
      }
      await Recipe.findByIdAndDelete(id);
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  }
);

router.post('/comments', connectEnsure.ensureLoggedIn({redirectTo: "/auth/login"}), async (req,res)=>{
  const userEmail = req.user.email
  try {
   const comment = new Comment({
   commentText: req.body.commentText,
   author : userEmail,
   recipeID : req.body.recipeID
   })
   await comment.save()
   req.flash('success','Comment Added Successfully')
   res.redirect('back')
  } catch (error) {
    console.log(error)
  }
})
// function ensureAuthenticated(req,res,next){
//   if(req.isAuthenticated()){
//     next()
//   }else{
//     res.redirect('/auth/login')
//   }
// }
// function ensureNotAuthenticated(req,res,next){
//   if(req.isAuthenticated()){
//     res.redirect('back')
//   }else{
//     next()
//   }
// }
module.exports = router;
