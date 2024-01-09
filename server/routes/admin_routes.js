const User = require("../models/user.model");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");

const mongoose = require("mongoose");
const { profile } = require("console");
const { roles } = require("./constants");
const moment = require('moment')

const router = require("express").Router();

router.get("/admin_dashboard", async (req, res) => {
  try {
    const recipesCount = await Recipe.countDocuments();
    const CategoryCount = await Category.countDocuments();
    const userCount = await User.countDocuments();
    const pending_post = await Recipe.find({
      status: "pending",
    }).countDocuments();
    const result = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalUsers: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    //  res.send(result)

    res.render("admin_dashboard", {
      mainContent: "admin_intro",
      recipesCount,
      CategoryCount,
      result,
      userCount,
      pending_post,
      person: req.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/Admin_Profile", (req, res) => {
  try {
    const test = res.render("admin_dashboard", {
      mainContent: "Admin_Profile",
      person: req.user,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/admin_category", async (req, res) => {
  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render("admin_dashboard", {
      mainContent: "admin_category",
      categories,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/new_category", async (req, res) => {
  try {
    const infoErrorsObj = req.flash("infoErrors");
    const infoSubmitObj = req.flash("infoSubmit");
    res.render("new_category", {
      title: "New category",
      infoErrorsObj,
      infoSubmitObj,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/submit-category", async (req, res) => {
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
      if (err) {
        console.log(err);
      }
    });
  }
  try {
    const newCategory = new Category({
      name: req.body.name,
      image: newImageName,
    });

    await newCategory.save();

    // req.flash("infoSubmit", "Category has been created.");
    res.redirect("/");
  } catch (error) {
    console.log(error);
    req.flash("infoErrors", error);
    res.redirect("/admin/new_category");
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.render("admin_dashboard", { mainContent: "users", users });
  } catch (err) {
    console.log(err);
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const person = await User.findById(id);
    res.render("profile", { person });
    // res.send(person)
  } catch (error) {
    console.log(error);
  }
});
router.post("/update-role", async (req, res) => {
  const { id, role } = req.body;
  if (!id || !role) {
    req.flash("error", "Invalid Request");
    return res.redirect("back");
  }

  //check for valid mongoose id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid Id");
    return res.redirect("back");
  }
  //check for valid role
  const rolesArray = Object.values(roles);
  if (!rolesArray.includes(role)) {
    req.flash("error", "Invalid Role");
    return res.redirect("back");
  }

  //admin cannot remove themeselves
  if (req.user.id === id) {
    req.flash("error", "Admins cannot remove themselves, ask another admin.");
    return res.redirect("back");
  }

  //finally update role
  const user = await User.findByIdAndUpdate(
    id,
    { role: role },
    { new: true, runValidators: true }
  );
  req.flash("info", `Updated role for ${user.email} to ${user.role}`);
  res.redirect("back");
});

router.get("/pending-post", async (req, res) => {
  const recipes = await Recipe.find({ status: "pending" });
  res.render("pending-post", { title: "Pending-post", recipes });
});

router.get("/recipe/:id", async (req, res) => {
  const id = req.params.id;
  const recipe = await Recipe.findById(id);
  res.render("pending_post_content", { title: "pending-post-content", recipe });
});

router.put("/approve_post/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const recipe = await Recipe.findByIdAndUpdate(id);
    recipe.status = "approved";
    await recipe.save();
    req.flash("success", "Recipe has been approved");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});


module.exports = router;
