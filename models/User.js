const mongoose = require('mongoose');

const User = mongoose.model("User", {
email : { type : String, required : true, unique : true },
account : { 
username : { type : String, required : true, unique : true },  
name : String,
description : String,    
avatar : Object
},
rooms : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Room"
}],
token : String,
hash : String,
salt : String
})

module.exports = User; 