const express = require("express");
require("dotenv").config();
const router = express.Router();
const User = require("../models/User");
const Room = require("../models/Room");
const SHA256 = require("crypto-js/sha256");
const uid2 = require("uid2");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/isAuthenticated");

// 1ère route pour inscrire l'utilisateur :

router.post("/user/signup", async (req, res) => {
  try {
    const { email, username, name, description, password } = req.fields;
    const userEmail = await User.findOne({ email: email });
    const userUsername = await User.findOne({ username: username });
    if (userEmail) {
      res.json("This email is already attached to an account");
    } else if (userUsername) {
      res.json("This username is already used");
    } else {
      if (email && username && password && description) {
        const salt = uid2(16);
        const hash = SHA256(req.fields.password + salt).toString(encBase64);
        const token = uid2(16);

        const newUser = new User({
          email: email,
          account: {
            username: username,
            description: description,
            name: name,
          },
          token: token,
          salt: salt,
          hash: hash,
        });
        await newUser.save();
        res.status(200).json({
          account: newUser.account,
          token: newUser.token,
          email: newUser.email,
          id: newUser.id,
        });
      } else {
        res.status(400).json({ message: "Missing parameters" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2ème route pour log in l'utilisateur :

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    if (email && password) {
      const userToFind = await User.findOne({ email: email });
      if (!userToFind) {
        res.json("User wasn't found");
      } else {
        const hash = SHA256(password + userToFind.salt).toString(encBase64);
        if (hash === userToFind.hash) {
          res.status(200).json({
            id: userToFind.id,
            token: userToFind.token,
            email: userToFind.email,
            account: userToFind.account,
          });
        } else {
          res.status(401).json("Unauthorized");
        }
      }
    } else {
      res.status(400).json("Missing parameters");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3ème route pour uploader l'avatar de l'utilisateur :

router.put("/user/upload_picture", isAuthenticated, async (req, res) => {
  try {
    if (req.files.photo) {
      const user = req.user;

      if (user.account.photo === null) {
        await cloudinary.uploader.upload(
          req.files.photo.path,
          {
            folder: "airbnb/user",
          },
          async function (error, result) {
            if (error) {
              res.status(400).json({ error: "An error occurred" });
            } else {
              const userToUpdate = await User.findByIdAndUpdate(user.id, {
                "account.photo": [
                  {
                    url: result.secure_url,
                    id: result.public_id,
                    name: req.files.photo.name,
                    type: req.files.photo.type,
                  },
                ],
              });
              await userToUpdate.save();

              const userUpdated = await User.findById(userToUpdate.id);
              res.json({
                id: userUpdated.id,
                email: userUpdated.email,
                username: userUpdated.account.username,
                name: userUpdated.account.name,
                description: userUpdated.account.description,
                photo: userUpdated.account.photo,
                rooms: userUpdated.rooms,
              });
            }
          }
        );
      } else {
        await cloudinary.uploader.destroy(user.account.photo[0].id);
        await cloudinary.uploader.upload(
          req.files.photo.path,
          {
            folder: "airbnb/users",
          },
          async function (error, result) {
            if (error) {
              res.status(400).json({ error: "An error occurred" });
            } else {
              const userToUpdate = await User.findByIdAndUpdate(user._id, {
                "account.photo": [
                  {
                    url: result.secure_url,
                    id: result.public_id,
                    name: req.files.photo.name,
                    type: req.files.photo.type,
                  },
                ],
              });
              await userToUpdate.save();

              const userUpdated = await User.findById(user._id);
              res.json({
                id: userUpdated._id,
                email: userUpdated.email,
                username: userUpdated.account.username,
                name: userUpdated.account.name,
                description: userUpdated.account.description,
                photo: userUpdated.account.photo,
                rooms: userUpdated.rooms,
              });
            }
          }
        );
      }
    } else {
      res.status(400).json({ error: "Missing picture" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4ème route pour effacer l'avatar de l'utilisateur :

router.put("/user/delete_avatar/:id", isAuthenticated, async (req, res) => {
  if (req.params.id) {
    try {
      const userAvatar = await User.findById(req.params.id);
      if (userAvatar) {
        if (userAvatar.account.avatar) {
          await cloudinary.uploader.destroy(
            userAvatar.account.avatar.picture_id
          );
          await User.findByIdAndUpdate(req.params.id, {
            "account.avatar": null,
          });
          const user = await User.findById(req.params.id);
          res.status(200).json({
            account: user.account,
            id: user.id,
            email: user.email,
            rooms: user.rooms,
          });
        } else {
          res
            .status(400)
            .json({ message: "There is no avatar attached to this account" });
        }
      } else {
        res.status(400).json({ message: "User wasn't found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing some parameters" });
  }
});

// 5ème route pour rechercher l'utilisateur par id et retourner les informations non-sensibles :

router.get("/user/:id", isAuthenticated, async (req, res) => {
  if (req.params.id) {
    try {
      const user = await User.findById(req.params.id);

      if (user) {
        res.status(200).json({
          id: user.id,
          photo: user.account.photo,
          account: user.account,
          rooms: user.rooms,
          email: user.email,
        });
      } else {
        res.status(401).json("User wasn't found");
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status("No id received");
  }
});

// 6ème route pour lire les annonces de l'utilisateur :

router.get("/user/rooms/:id", async (req, res) => {
  if (req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      if (user) {
        const rooms = user.rooms;
        if (rooms.length > 0) {
          let tab = [];
          for (let i = 0; i < rooms.length; i++) {
            const room = await Room.findById(rooms[i]);
            tab.push(room);
          }
          res.status(200).json(tab);
        } else {
          res.status(400).json("This user has no rooms registered");
        }
      } else {
        res.status(400).json("User wasn't found");
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status("No id received");
  }
});

// 7ème route pour modifier l'utilisateur (sauf avatar)

router.put("/user/update", isAuthenticated, async (req, res) => {
  const { username, email, description } = req.fields;

  try {
    const userToCheck = await req.user;
    const userEmail = await User.findOne({ email: email });
    const userUsername = await User.findOne({
      "account.username": username,
    });

    // check if email or username are already in DB
    if (userEmail && userToCheck.email !== email) {
      return res.status(400).json({ error: "This email is already used." });
    } else if (userUsername && userToCheck.account.username !== username) {
      return res.status(400).json({ error: "This username is already used." });
    } else {
      if (email || description || username) {
        if (email !== userToCheck.email) {
          userToCheck.email = email;
        }
        if (username !== userToCheck.account.username) {
          userToCheck.account.username = username;
        }
        if (description !== userToCheck.account.description) {
          userToCheck.account.description = description;
        }

        await userToCheck.save();

        res.json({
          id: userToCheck._id,
          email: userToCheck.email,
          username: userToCheck.account.username,
          name: userToCheck.account.name,
          description: userToCheck.account.description,
          photo: userToCheck.account.photo,
          rooms: userToCheck.rooms,
        });
      } else {
        res.status(400).json({ error: "Missing information" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
