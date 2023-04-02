const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const fetchuser = require("../middleware/fetchuser");

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    // generate hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    // Create user
    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });

    // save user and return response
    const user = await newUser.save();
    res.status(200).send("User created successfully.");
  } catch (error) {
    res.status(500).json(error);
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    // Check if user exists
    if (!user) {
      res.status(404).send("User not found");
    } else {
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      //   Check if password is correct
      if (!validPassword) {
        res.status(400).send("Wrong Password");
      } else {
        // If everything is correct then send a response to user
        res.status(200).json(user);
      }
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// UPDATE USER
router.put("/:id", fetchuser, async (req, res) => {
  try {
    // check if the user trying to update his account
    if (req.params.id === req.header("auth-id")) {
      const user = await User.findById(req.params.id);
      const validPass = await bcrypt.compare(req.body.password, user.password);

      //   check if the password is matched
      if (validPass) {
        // if the user wanted to update his password
        if (req.body.newPass) {
          try {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.newPass, salt);
          } catch (error) {
            res.status(500).json(error);
          }
        }
        // if the user dont want to update his password
        else {
          try {
            const nsalt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, nsalt);
          } catch (error) {
            res.status(500).json(error);
          }
        }

        // update all the details that user want to update and send response
        try {
          const okuser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body,
          });
          res.status(200).send("Account has been updated.");
        } catch (error) {
          res.status(500).json(error);
        }
      } else {
        res.status(404).send("password incorrect");
      }
    } else {
      res.status(403).json("You can only update your acccount");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// DELETE USER
router.delete("/:id", fetchuser, async (req, res) => {
  try {
    // check user is trying to delete his account or not
    if (req.params.id === req.header("auth-id")) {
      const user = await User.findById(req.params.id);
      const validPass = await bcrypt.compare(req.body.password, user.password);

      //   check if the password is matched
      if (!validPass) {
        res.status(404).send("Wrong password. Try again.");
      } else {
        // if the password is matched then delete the user by id
        try {
          await User.findByIdAndDelete(req.params.id);
          res.status(200).send("User deleted Successfully.");
        } catch (error) {
          res.status(500).json(error);
        }
      }
    } else {
      res.status(401).send("You can't delete other users account");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// FOLLOW USER
router.put("/:id/follow", fetchuser, async (req, res) => {
  try {
    // check if user is trying to follow himself or not
    if (req.params.id !== req.header("auth-id")) {
      // find the user who should be followed
      const user = await User.findById(req.params.id);

      // find the user who wants to follow
      const currentUser = await User.findById(req.header("auth-id"));

      // check if the user already follow that user or not
      if (user.followers.includes(req.header("auth-id"))) {
        res.status(403).send("You already follow this user.");
      } else {
        // just follow the user and send the response
        await user.updateOne({ $push: { followers: req.header("auth-id") } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).send("From now, you follow this user.");
      }
    } else {
      res.status(403).send("You can't follow yourself.");
    }
  } catch (error) {
    res.status(500).json(error)
  }
});

// UNFOLLOW USER
router.put("/:id/unfollow", fetchuser, async (req, res) => {
    try {
      // check if user is trying to unfollow himself or not
      if (req.params.id !== req.header("auth-id")) {
        // find the user who should be unfollowed
        const user = await User.findById(req.params.id);
  
        // find the user who wants to unfollow
        const currentUser = await User.findById(req.header("auth-id"));
  
        // check if the user already follow that user or not
        if (!user.followers.includes(req.header("auth-id"))) {
          res.status(403).send("You didn't followed him yet");
        } else {
          // just unfollow the user and send the response
          await user.updateOne({ $pull: { followers: req.header("auth-id") } });
          await currentUser.updateOne({ $pull: { followings: req.params.id } });
          res.status(200).send("From now, you unfollow this user.");
        }
      } else {
        res.status(403).send("You can't unfollow yourself.");
      }
    } catch (error) {
      res.status(500).json(error)
    }
  });
// GET USER
router.get("/:id", fetchuser, async (req, res) => {
  try {
    // get the user by id
    const getUser = await User.findById(req.params.id);

    // filter out the password and updatedAt details
    const { password, updatedAt, ...others } = getUser._doc;
    res.status(200).json(others);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
