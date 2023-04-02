const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

async function connectToMongo() {
    try{
        await mongoose.connect(process.env.mongoURI);
        console.log('Connected to Mongo');
    }catch(err){
        console.log(err);
    }

}

module.exports = connectToMongo;
