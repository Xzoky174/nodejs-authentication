const mongoose = require("mongoose");
const { isEmail } = require("validator");

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: [isEmail, "Invalid email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
