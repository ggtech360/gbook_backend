const fetchuser = require("../middleware/fetchuser");
const Post = require("../models/Post");
const User = require("../models/User");
const router = require("express").Router();

// create post
router.post("/create", fetchuser, async (req, res) => {
  // destructure all the thing from req.body
  const { postDesc, postImg, likes, comments } = req.body;

  // create new post
  const post = new Post({
    postDesc,
    postImg,
    likes,
    comments,
    user: req.header("auth-id"),
  });
  try {
    // save the post and send response
    await post.save();
    res.status(200).send("posted successfully.");
  } catch (error) {
    res.status(500).json(error);
  }
});

// edit post
router.put("/:id", fetchuser, async (req, res) => {
  try {
    // find post by user id
    const post = await Post.findById(req.params.id);

    // check if post exists or not
    if (!post) {
      res.status(404).send("No post found");
    } else {
      // check if the post belongs to the user or not
      if (post.user === req.header("auth-id")) {
        await Post.findByIdAndUpdate(req.params.id, { $set: req.body });
        res.status(200).send("post updated successfully.");
      } else {
        res.status(401).send("You can't edit others post.");
      }
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete post
router.delete("/:id", fetchuser, async (req, res) => {
  try {
    // find post by id
    const post = await Post.findById(req.params.id);

    // check post exists or not
    if (post) {
      // check if that post belongs to that user or not
      if (post.user === req.header("auth-id")) {
        // delete post and send response
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).send("Post deleted successfully.");
      } else {
        res.status(403).send("You can't delete others post.");
      }
    } else {
      res.status(404).send("Post not found.");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// like a post
router.put("/:id/like", fetchuser, async (req, res) => {
  try {
    // find post by id
    const post = await Post.findById(req.params.id);

    // check user already liked that post or not
    if (post.likes.includes(req.header("auth-id"))) {
      // if liked then dislike that post
      await post.updateOne({ $pull: { likes: req.header("auth-id") } });
      res.status(200).send("Post disliked successfully.");
    } else {
      // if not liked then like that post
      await post.updateOne({ $push: { likes: req.header("auth-id") } });
      res.status(200).send("Post liked successfully.");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// get user post
router.get("/:id/get", fetchuser, async (req, res) => {
  try {
    const post = await Post.find({ user: req.params.id });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get followings post
router.get("/fetchpost", fetchuser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.header("auth-id"));
    const userPost = await Post.find({ user: req.header("auth-id") });
    const friendPost = await Promise.all(
      currentUser.followings.map((followId) => {
        return Post.find({ user: followId });
      })
    );
    res.status(200).json(userPost.concat(...friendPost));
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
