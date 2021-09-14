const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(formidable());

const userRoutes = require("./routes/user");
app.use(userRoutes);

const roomRoutes = require("./routes/room");
app.use(roomRoutes);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/airbnb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  // api_key: "261736918651169",
  // api_secret: "IfiCJGwqu4qo-2we6C1S0pG_QnI",
  // cloud_name: "dgwleomuz",

  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.get("/", function (req, res) {
  res.send("Welcome to the Airbnb back_end API.");
});

app.all("*", (req, res) => {
  res.status(400).json("Impossible de trouver cette page");
});

// app.listen(process.env.PORT, () => {
app.listen(3000, () => {
  console.log("Server started");
});
