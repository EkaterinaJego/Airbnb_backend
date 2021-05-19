const express = require('express');
const formidable = require('express-formidable');
const mongoose = require("mongoose");


const app = express();
app.use(formidable());

const userRoutes = require('./routes/user');
app.use(userRoutes);

mongoose.connect("mongodb://localhost:27017/airbnb", {
    useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex : true
});

app.listen(3000, () => {
    console.log("Server has started")
}); 