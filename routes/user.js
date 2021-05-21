const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require('../models/Room');
const SHA256= require('crypto-js/sha256');
const uid2 = require("uid2");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require('cloudinary').v2;
const isAuthenticated = require('../middlewares/isAuthenticated');


router.post('/user/signup', async (req,res) => {
try {
const { email, username, name, description } = req.fields;
const salt = uid2(16);
const hash = SHA256(req.fields.password + salt).toString(encBase64);
const token = uid2(16);
if (email && username) { 
const emailToCheck = await User.findOne({ email : email }) ;
    if (emailToCheck) {
    res.status(400).json({message : `${email} has already an account`});}
    else { 
    const newUser = new User ({
    email : email,
    account : {
     username : username,
     description : description,
     name : name
    },
     token : token,
     salt : salt,
     hash : hash,
        })
await newUser.save();
res.json({ username : username, name : name, description : description, token : token, email : email, id : newUser.id });
        }}
    else { res.status(400).json({message : "Missing parameters"})} 
    } catch (error) {
        res.status(400).json({message : error.message})
    }
})

router.post("/user/login", async (req,res) => {
try {
const userToFind = await User.findOne({email : req.fields.email});
    if (!userToFind) {
    res.json('Unauthorized');
        } 
        else {
    const hash = SHA256(req.fields.password + userToFind.salt).toString(encBase64);
        if (hash === userToFind.hash) {
            res.status(200).json({id : userToFind.id, token : userToFind.token, email : userToFind.email, username : userToFind.username, description : userToFind.description, name : userToFind.name});
        } else { res.status(400).json("Wrong password")}
        }
    } catch (error) {
        res.status(400).json({message : error.message})
}})

router.post("/user/upload_avatar/:id", isAuthenticated, async (req,res) => {
if (req.files.picture) { 
   try {
    const userAvatar = await User.findById(req.params.id);
    if (userAvatar) {
        if (!userAvatar.avatar) { 
        const newAv = {};
        const result = await cloudinary.uploader.upload(req.files.picture.path, {folder: `/airbnb/user_avatar/${userAvatar.id}`});
        newAv.url = result.secure_url;
        newAv.picture_id = result.public_id; 
        await User.findByIdAndUpdate(req.params.id, {avatar : newAv});
        await userAvatar.save();
        res.status(200).json({message : { account : { photo : userAvatar.avatar, username : userAvatar.username, description : userAvatar.description}, email : userAvatar.email, id : userAvatar.id }})
        }
        else { 
        const avToModif = {};
        const result = await cloudinary.uploader.upload(req.files.picture.path, {folder: `/airbnb/user_avatar/${userAvatar.id}`})
        avToModif.url = result.secure_url;
        avToModif.picture_id = result.public_id;
        await User.findByIdAndUpdate(req.params.id, {avatar : avToModif});
        await userAvatar.save();
        res.status(200).json({message : { account : { photo : userAvatar.avatar, username : userAvatar.username, description : userAvatar.description}, email : userAvatar.email, id : userAvatar.id }})
        } }
        else { res.status(400).json({error : "User wasn't found"})};
   } catch (error) {
        res.status(400).json({message : error.message})}
   }
     else {res.status(400).json("The photo wasn't sent")}
});

router.post("/user/delete_avatar/:id", 
async (req,res) => {
    try {
    const userAvToDel = await User.findById(req.params.id);
    if (userAvToDel) {
        let avatarId = userAvToDel.avatar.asset_id; 
        avatarId = null; 
        userAvToDel.save();
        res.json("The photo was destroyred")}
    } catch (error) {
    res.status(400).json({message : error.message})        
    }})


module.exports = router;

