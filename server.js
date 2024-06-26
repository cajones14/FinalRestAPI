//May be able to exclude next line
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
//import cors

//const corsOptions = require('./config/corsOptions');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

//Connect to MongoDB
connectDB();

//Cors = cross origin resource sharing
//app.use(cors(corsOptions));
app.use(cors());

/* // allow options to pass preflight
app.options("/*", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
}); */

//built in middleware to handle unlencoded data
//in other words, form data:
//'content-type: application/x-www-form0urlencoded'
app.use(express.urlencoded({ extended: false }));

//built-in middleware for jason
app.use(express.json());

//serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

//routes
app.use('/', require('./routes/root'));
app.use('/states', require('./routes/api/states'));

//default "catch all" - custom 404 page
app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }else if(req.accepts('json')){
        res.json({ error: "404 Not Found"});
    }else{
        res.type('txt').send("404 Not Found");
    }
});


mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});