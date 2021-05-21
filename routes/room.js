const express= require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { findById } = require('../models/User');

// 1ère route pour publier l'annonce :

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
   
        });
    await newRoom.save();

    // Ajouter une nouvelle clé "rooms" dans le profil de l'user :

    const user = await User.findById(req.user.id);
    let tab = user.rooms;
    tab.push(newRoom.id);
    await user.save();
   
   res.status(200).json({id : newRoom.id, title : newRoom.title, description : newRoom.description, price : newRoom.price, location : locationTab, user : req.user.id });
} catch (error) {
    res.status(400).json({message : error.message})
    }
}
else { res.status(400).json({message : "Missing parameters"})
}})

// 2ème route pour consulter toutes les offres dans les bdd Rooms :

router.get("/rooms", async (req, res) => { 
try {
const roomsToCheck = await Room.find({}, {description : false});
console.log(roomsToCheck);
res.status(200).json({roomsToCheck});
     
 } catch (error) {
    res.status(400).json({message : error.message})  
 }
})

// 3ème route pour trouver une route particulière par son ID :

router.get("/room/:id", async (req, res) => {

try {
const roomToFind = await Room.findById(req.params.id);
if (roomToFind) { 
const userObj = {};
const user = await User.findById(roomToFind.user);
userObj.username = user.account.username;
userObj.description = user.account.description;
userObj.name = user.account.name;
userObj.avatar = user.account.avatar;

res.status(200).json({photos : roomToFind.photos, location : roomToFind.location, id : roomToFind.id, title : roomToFind.title, description : roomToFind.description, price : roomToFind.price, user : userObj, });

} else {res.json({message : "No room found"})}
        
} catch (error) {
res.status(400).json({message : error.message})      
    }
})

// 4ème route pour modifier l'annonce :

router.put("/room/update/:id", isAuthenticated, async (req, res) => {

const {title, description, price, location } = req.fields;

if (title || description || price || location) {
    try {
    const roomToFind = await Room.findById(req.params.id);
    if (roomToFind) {
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
}  else {res.status(400).json({message : "Room not found"})}
}
catch (error) {
res.status(400).json({message : error.message})     
}}
else { 
res.json("Missing parameters to modify")
}})

// 5ème route pour effacer l'annonce de la BDD : 

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

// 6ème route pour filter les annonces :

router.post("/rooms", async (req, res) => {

const {title, priceMin, priceMax } = req.query;
 const filters = {};
    try {
    if (title) {
    filters.title = new RegExp(title, "i")};

    if (priceMin) {
    filters.price = {$gte : Number(priceMin)}
        };
    if (priceMax) {
    if (filters.price) { 
        filters.price.$lt = Number(priceMax) }
    else { 
    filters.price = {$lt : Number(priceMax)};
         }
    };
    const sort = {};
    if (req.query.sort === "price-asc") {
    sort.price = 1; 
    } ;
    if (req.query.sort === "price-desc") {
    sort.price = -1;
    };

    let page = Number(req.query.page);
    let limit = Number(req.query.limit);

    if (page < 1) {
    return page = 1;
    } else { page  = page }

    const count = await Room.countDocuments(filters);  
    const rooms = await Room.find(filters).sort(sort).skip((page - 1)*limit).limit(limit);
    res.status(200).json({ count : count, rooms : rooms});
    
    } catch (error) {
    res.status(400).json({message : error.message})     
        }
    })
    
    

module.exports = router; 