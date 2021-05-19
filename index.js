const express = require('express');
const formidable = require('express-formidable');
const mongoose = require("mongoose");


const app = express();
app.use(formidable());

const userRoutes = require('./routes/user');
app.use(userRoutes);

const roomRoutes = require('./routes/room');
app.use(roomRoutes);

mongoose.connect("mongodb://localhost:27017/airbnb", {
    useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex : true
});

app.all("*", (req,res) => {
    res.status(400).json('Impossible de trouver une page')
})

app.listen(3000, () => {
    console.log("Server has started")
}); 