
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SHA256= require('crypto-js/sha256');
const uid2 = require("uid2");
const encBase64 = require("crypto-js/enc-base64");

router.post('/user/signup', async (req,res) => {
try {
const { email, username, name, description } = req.fields;
const salt = uid2(16);
const hash = SHA256(req.fields.password + salt).toString(encBase64);
const token = uid2(16);
if (email && username) { 
const emailToCheck = await User.findOne({ email : email }) ;
    if (emailToCheck) {
    res.status(400).json({message : `${email} is already in the DB`});}
    else { 
    const newUser = new User ({
     email : email,
     username : username,
     description : description,
     name : name,
     token : token,
     salt : salt,
     hash : hash,
        })
await newUser.save();
res.json({ username : username, name : name, description : description, token : token, email : email, id : newUser.id });
        }}
    else { res.status(400).json({message : "Email ou username is missing"})} 
    } catch (error) {
        res.status(400).json({message : error.message})
    }
})


module.exports = router;

