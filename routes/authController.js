const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/users");

require("dotenv").config({
  path: ".env.local",
});

const router = express.Router();

const getToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SIGNATURE, {
    expiresIn: "15d",
  });
};

router.get("/users", async (_, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch {
    res
      .status(500)
      .json({ message: "Uh Oh. An Internal Server Error Occured..." });
  }
});

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (password.length < 8) {
    res
      .status(400)
      .json({ message: "Password must be more than 8 characters" });

    return;
  }

  const encryptedPassword = await bcrypt.hash(password.toString(), 10);

  try {
    const user = await User.create({ email, password: encryptedPassword });

    const token = getToken(user._id);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 15);

    res.cookie("token", token, { httpOnly: true, maxAge: expirationDate });

    res.status(201).json(user);
  } catch (err) {
    let message;

    if (err.message.includes("User validation failed")) {
      const errors = err.errors;

      message = errors.email
        ? errors.email.properties.message
        : errors.password.properties.message;
    } else if (err.message.includes("duplicate key error collection")) {
      message = "User is already registered";
    }
    if (message) {
      res.status(400).json({ message: message });
    } else {
      res.status(500).json({
        message: "Uh Oh. An Internal Server Error Occured...",
      });
    }
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({ message: "This user does not exist" });
    return;
  }

  const matches = await bcrypt.compare(password, user.password);

  if (matches) {
    const token = getToken(user._id);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 15);

    res.cookie("token", token, { httpOnly: true, maxAge: expirationDate });

    res.json({ message: "Successful!" });
  } else {
    res.status(400).json({ message: "Incorrect password" });
  }
});

router.get("/authenticate", (req, res) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SIGNATURE, (err, _) => {
      if (err) {
        res.status(400).json({ data: false });
      } else {
        res.status(200).json({ data: true });
      }
    });
  } else {
    res.status(400).json({ data: false });
  }
});

module.exports = router;
