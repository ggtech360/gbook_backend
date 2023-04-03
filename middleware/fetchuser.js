const User = require("../models/User");

const fetchuser = async (req, res, next) => {
  // get the user from the id and add it to req object
  const token = req.header("auth-id");
  if (!token) {
    return res
      .status(401)
      .send({ error: "Please athenticate with a valid token" });
  } else {
    try {
      const user = await User.findById(token);
      if (user) {
        next();
      }
    } catch (error) {
      res.status(401).send({ error: "Please athenticate with a valid token" });
    }
  }
};

module.exports = fetchuser;
