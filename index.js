const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/authController");
const cookieParser = require("cookie-parser");

const app = express();

const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URL, (err) => {
  if (err) {
    console.log(err);
    console.log("Terminated");
  } else {
    app.listen(port, () => {
      console.log("Connected to DB!");
      console.log(`Listening on Port ${port}!`);
    });
  }
});

app.use("/api", userRoutes);
