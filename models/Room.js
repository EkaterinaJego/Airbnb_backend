const mongoose = require("mongoose");

const Room = mongoose.model("Room", {
    title = String,
    description = String,
    price : Number, 
    location : {
        lat : Number,
        lng : Number
    },
})


module.exports = Room; 