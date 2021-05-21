const express= require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const isAuthenticated = require('../middlewares/isAuthenticated');

router.post("/room/publish", isAuthenticated, async (req, res) => { 
    
const {title, description, price, location } = req.fields;

    if (title && description && price && location) {
    try {
    const locationTab = [location.lat, location.lng];
    const newRoom = new Room({
    title : title,
    description : description,
    price : price,
    location : locationTab,
    user : req.user,
    photos : []
        });
    await newRoom.save();

    // Ajouter une nouvelle clé "rooms" dans le profil de l'user :

    const user = await User.findById(req.user.id);
    let tab = user.rooms;
    tab.push(newRoom.id);
    await user.save();
   
   res.status(200).json({id : newRoom.id, title : newRoom.title, description : newRoom.description, price : newRoom.price, location : locationTab, user : req.user.id, photos : []});
} catch (error) {
    res.status(400).json({message : error.message})
    }
}
else { res.status(400).json({message : "Missing parameters"})
}})

router.get("/rooms", async (req, res) => { // route pour trouver toutes les offres dans la bdd
 try {
const roomsToCheck = await Room.find({}, {description : false});
console.log(roomsToCheck);
res.status(200).json({roomsToCheck});
     
 } catch (error) {
    res.status(400).json({message : error.message})  
 }
})

router.get("/room/:id", async (req, res) => {
try {
const roomToFind = await Room.findById(req.params.id).populate("user user.account");  // Populate ne fonctionne pas 
res.status(200).json({photos : roomToFind.photos, location : roomToFind.location, id : roomToFind.id, title : roomToFind.title, description : roomToFind.description, price : roomToFind.price, user : roomToFind.user.account});
        
} catch (error) {
    res.status(400).json({message : error.message})      
    }
})

router.put("/room/update/:id", isAuthenticated, async (req, res) => {
const {title, description, price, location } = req.fields;
if (title || description || price || location) {
    try {
    const roomToFind = await Room.findById(req.params.id);
    if (title) {
     roomToFind.title = title
    };
    if (description) {
        roomToFind.description = description
    };
    if (price) {
        roomToFind.price = price
    };
    if (location) {
        roomToFind.location = location
    };
await roomToFind.save();
res.status(200).json({message : roomToFind});
} 
catch (error) {
res.status(400).json({message : error.message})     
}}
else { 
    "There is no modification"
}})


router.delete("/room/delete/:id", isAuthenticated, async (req,res) => {
try {
const roomToDelete = await Room.findById(req.params.id);
if (roomToDelete) {
const user = await User.findById(req.user.id);
let tab = user.rooms; 
for (let i = 0; i < tab.length; i++) {
    if (String(tab[i]) === req.params.id) {
        tab.splice(tab.indexOf(req.params.id), 1);
        await user.save();  

await Room.findByIdAndDelete(req.params.id);

}}
res.status(200).json({message : "Room was successfully deleted"})
}
else { res.json({message : "Room wasn't found"})}
}
catch (error) {
   res.status(400).json({message : error.message}) 
}
})

module.exports = router; 