//May be able to exclude next line
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
//import cors
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
//import logEvents
const { logger } = require('./middleware/logEvents');
//define port for webserver
const errorHandler = require('./middleware/errorHandler');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

//Connect to MongoDB
connectDB();

//custom middleware logger
app.use(logger);

//Cors = cross origin resource sharing
app.use(cors(corsOptions));

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

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
