const router = require("express").Router();
const Recipe = require("../models/Recipe");
router.get("/profile", async (req, res) => {
  try {
    const person = req.user;
    const id = person.id;
    const food = await Recipe.find({ userId: id, status: "approved" });
    res.render("profile", { title: "profile", person, food });
    // res.send(id)
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
