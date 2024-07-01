const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const departmentRoutes = require("./routes/usersRoutes/departmentRoutes");
const StudentRoutes = require("./routes/usersRoutes/StudentRoutes")
const emailSender = require('./controllers/emailSender');
// Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use(departmentRoutes);
app.use(StudentRoutes);
app.get("/test", (req, res) => {
  res.send("API is working");
});


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running...');
            emailSender();
        });
    })
    .catch((err) => {
        console.log(err);
    });
