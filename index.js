const express = require('express');
const formidable = require('express-formidable');
const mongoose = require("mongoose");
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const app = express();
app.use(formidable());

const userRoutes = require('./routes/user');
app.use(userRoutes);

const roomRoutes = require('./routes/room');
app.use(roomRoutes);

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex : true, useFindAndModify: false
});

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.all("*", (req,res) => {
    res.status(400).json('Impossible de trouver une page')
})

app.listen(process.env.PORT, () => {
    console.log("Server has started")
}); 