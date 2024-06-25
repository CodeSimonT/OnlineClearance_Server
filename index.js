const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const departmentRoutes = require('./routes/usersRoutes/departmentRoutes');

//middle ware
const app = express();
app.use(express.json);
app.use(express.urlencoded({ extended: false }));
app.use(cors());

//routes
app.use(departmentRoutes)

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    app.listen(3000, ()=>{
        console.log('Server is running...')
    })
}).catch((err)=>{
    console.log(err);
})