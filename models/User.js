const mongoose = require('mongoose');

const User = mongoose.model("User", {
email : {
    unique : true,
    type : String
},
password : {
    // required : true, // Si j'active, on me dit que le path password is required.
    type : String,
    min : [10, "The password is too short, the minimal size is 10 caracters"]
},
account : { 
    username : {
        required : true,
        type : String
    },  
    name : String,
    description : String,    
}, 
avatar : { type: mongoose.Schema.Types.Mixed, default: {} },
token : String,
rooms : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Room"
}],
hash : String,
salt : String
})

module.exports = User; 