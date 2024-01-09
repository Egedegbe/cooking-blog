const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { roles } = require("../routes/constants");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowerCase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [roles.admin, roles.moderator, roles.client],
      default: roles.client,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSaltSync(10);
      const hasedPassword = await bcrypt.hash(this.password, salt);
      this.password = hasedPassword;
      if (this.email == process.env.ADMIN_EMAIL.toLowerCase()) {
        this.role = roles.admin;
      }
    }
    next();
  } catch (err) {
    console.log(err);
  }
});

UserSchema.methods.isValidpassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.log(error);
  }
};

const User = mongoose.model("user", UserSchema);
module.exports = User;
