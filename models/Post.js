const mongoose = require("mongoose");

const PostSchema = mongoose.Schema(
  {
    postDesc: {
      type: String,
      max: 500,
    },
    postImg: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    user:{
        type: String,
        required:true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
