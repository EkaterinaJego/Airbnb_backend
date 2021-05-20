const mongoose = require("mongoose");
const User = require('../models/User');


const Room = mongoose.model("Room", {
    title : String,
    description : String,
    price : Number, 
    location : [Number],
     user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }, 
    photos : [Object]
})


module.exports = Room; 