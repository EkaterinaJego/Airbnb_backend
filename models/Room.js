const mongoose = require("mongoose");
const User = require("../models/User");

const Room = mongoose.model("Room", {
  title: String,
  description: String,
  price: Number,
  ratingValue: Number,
  reviews: Number,
  location: {
    type: [Number],
    index: "2d",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  photos: Array,
});

module.exports = Room;
