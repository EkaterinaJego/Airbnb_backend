const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require('../models/Room');
const SHA256= require('crypto-js/sha256');
const uid2 = require("uid2");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require('cloudinary').v2;
const isAuthenticated = require('../middlewares/isAuthenticated');


// 1ère route pour inscrire l'utilisateur : 

router.post('/user/signup', async (req,res) => {
try {
const { email, username, name, description } = req.fields;
const userEmail = await User.findOne({email : email});
const userUsername = await User.findOne({username : username}); 
if (userEmail) {
     res.json("This email is already attached to an account"); 
 } else if (userUsername) {
   res.json("This username is already used")
 } 
   else { 
    if (email && username && name && description) { 
    const salt = uid2(16);
    const hash = SHA256(req.fields.password + salt).toString(encBase64);
    const token = uid2(16);

    const newUser = new User ({
    email : email,
    account : {
     username : username,
     description : description,
     name : name,
    },
     token : token,
     salt : salt,
     hash : hash,
        })
await newUser.save();
res.status(200).json({ account : newUser.account, token : token, email : email, id : newUser.id });
        }
    else { res.status(400).json({message : "Missing parameters"})} 
    }} catch (error) {
        res.status(400).json({message : error.message})
    }
});


// 2ème route pour log in l'utilisateur : 

router.post("/user/login", async (req,res) => {
try {
if (req.fields.email && req.fields.password) { 
const userToFind = await User.findOne({email : req.fields.email});
if (!userToFind) {
res.json("User wasn't found");} 
    else {
    const hash = SHA256(req.fields.password + userToFind.salt).toString(encBase64);
     if (hash === userToFind.hash) {
        res.status(200).json({id : userToFind.id, token : userToFind.token, email : userToFind.email, account : userToFind.account});
    } else { res.status(400).json("Unauthorized")}
        }
    } else {res.status(400).json("Missing parameters")}
}
    catch (error) {
        res.status(400).json({message : error.message})
}})

// 3ème route pour uploader l'avatar de l'utilisateur : 

router.put("/user/upload_avatar/:id", isAuthenticated, async (req,res) => {
if (req.files.picture) { 
   try {
    const userAvatar = await User.findById(req.params.id);
    if (userAvatar) {
        if (!userAvatar.account.avatar) { 
        const newAv = {};
        const result = await cloudinary.uploader.upload(req.files.picture.path, {folder: `/airbnb/user_avatar/${userAvatar.id}`});
        newAv.url = result.secure_url;
        newAv.picture_id = result.public_id; 
        await User.findByIdAndUpdate(req.params.id, { "account.avatar" : newAv,});
        const userUpd = await User.findById(req.params.id);
        res.status(200).json({
        account : userUpd.account, email : userUpd.email, id : userUpd.id, rooms : userUpd.rooms })
        }
        else { 
        const newAv = {};
        const result = await cloudinary.uploader.upload(req.files.picture.path, {public_id : userAvatar.account.avatar.picture_id, folder: `/airbnb/user_avatar/${userAvatar.id}`})
        newAv.url = result.secure_url;
        newAv.picture_id = result.public_id; 
        await User.findByIdAndUpdate(req.params.id, { "account.avatar" : newAv,});
        const userUpd = await User.findById(req.params.id);
        res.status(200).json({
        account : userUpd.account, email : userUpd.email, id : userUpd.id, rooms : userUpd.rooms })
        }
      
    }   else { res.status(401).json({error : "User wasn't found"})
   } 
   } catch (error) {
    res.status(400).json({message : error.message})}
}
     else {res.status(400).json("The avatar picture wasn't sent")}
});

// 4ème route pour effacer l'avatar de l'utilisateur :

router.put("/user/delete_avatar/:id", isAuthenticated, async (req,res) => {
if (req.params.id) { 
    try {
    const userAvatar = await User.findById(req.params.id);
        if (userAvatar) { 
            if (userAvatar.account.avatar) {
            await cloudinary.uploader.destroy(userAvatar.account.avatar.picture_id);
            await User.findByIdAndUpdate(req.params.id, {"account.avatar" : null});
            const user = await User.findById(req.params.id);
            res.status(200).json({ account : user.account, id : user.id, email : user.email, rooms : user.rooms})
    } 
    else { res.status(400).json({message : "There is no avatar attached to this account"})}
    } 
    else { res.status(400).json({message : "User wasn't found"})}

    } 
    catch (error) { res.status(400).json({message : error.message}) 
    }}
    else { res.status(400).json({message : "Missing some parameters"})}});

module.exports = router;

