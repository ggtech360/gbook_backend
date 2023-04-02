const router = require("express").Router();

router.get("/", (req,res)=>{
    res.send('It is user route')
})

module.exports = router;

