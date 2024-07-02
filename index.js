const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const departmentRoutes = require("./routes/usersRoutes/departmentRoutes");
const StudentRoutes = require("./routes/usersRoutes/StudentRoutes");
const termRoutes = require("./routes/activeClearanceRoute/termRoutes");

// Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use(departmentRoutes);
app.use(StudentRoutes);
app.use(termRoutes);


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running...');
        });
    })
    .catch((err) => {
        console.log(err);
    });
