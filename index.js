const express = require('express');
const connectToMongo = require('./db');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoute = require('./route/users');
const authRoute = require('./route/auth');
const postsRoute = require('./route/posts');

// Connect to mongoDB
connectToMongo();

//Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/post", postsRoute);

app.listen(8800, ()=>{
    console.log('Backend Server is Running now...');
})