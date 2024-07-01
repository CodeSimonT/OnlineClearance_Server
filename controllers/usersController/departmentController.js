const department = require('../../model/usersModel/departmentModel');
const activeRequestSchema = require('../../model/activeRequestModel/activeRequest');
const Token = require('../../model/token'); 

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const emailSender = require('../emailSender');

const registerDepartment = async (req, res) => {
    try {
        const saltRounds = 10;
        const deFaultPasswords = "admin123";

        bcrypt.hash(deFaultPasswords, saltRounds, async function(err, hash) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            try {
                const departmentInfo = await department.create({
                    department:req.body.department,
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                    email:{
                        email:req.body.email,
                        verified:false,
                        temp:''
                    },
                    password:hash,
                    activeRequest:req.body.department,
                });
                const activeRequest = await activeRequestSchema.create({ request: [] });

                departmentInfo.activeRequest = activeRequest._id;
                await departmentInfo.save();

                return res.status(201).json({ message: 'Registration success' });
            } catch (error) {
                return res.status(500).json({ message: error.message });
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const loginDepartment = async (req, res) => {
    try {
        const { departmentName, password } = req.body;
        // Find the department by name
        const departmentList = await department.findOne({ department: departmentName });
        if (!departmentList) {
            return res.status(401).json({ message: "Department not registered!" });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, departmentList.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Generate token
        const token = jwt.sign(
            { departmentID: departmentList._id },
            process.env.ACCESS_ADMIN_TOKEN,
            { expiresIn: '7d' }
        );

        // Send the token as a response
        res.status(200).json({ token, departmentID: departmentList._id });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
}

const getSingleDepartment = async(req,res)=>{
    try {
        const id = req.query.id;

            const departmentData = await department.findById(id)

                if(!departmentData){
                    return res.status(404).json({message:"Department not found!"})
                }

                const newdepartmentData = {
                    _id:departmentData._id,
                    department:departmentData.department,
                    firstName:departmentData.firstName,
                    lastName:departmentData.lastName,
                    email:departmentData.email,
                    activeRequest:departmentData.activeRequest
                }

            return res.status(201).json(newdepartmentData)
    } catch (error) {
        return res.status(500).json({ message: error });
    }
}

const handleUpdateEmail = async (req, res) => {
    try {
        const { email, userID } = req.body;

        const user = await department.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'Department not found!' });
        }

        // Generate token with expiration of 5 minutes
        const token = jwt.sign(
            { departmentID: user._id },
            process.env.EMAIL_ACCESS_TOKEN,
            { expiresIn: '5m' }
        );

        // Store token in MongoDB
        await Token.create({ token, email, userID, expiration: new Date(Date.now() + 5 * 60 * 1000) });

        const url = `${process.env.SERVER_URL}/osc/api/authenticateEmail?authenticate=${token}&email=${email}`;

        emailSender(url, email);

        return res.status(201).json({ message: 'A link to change your email address has been sent to your email.' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateAndAuthenticateEmail = async (req, res) => {
    try {
        const { authenticate, email } = req.query;

        // Find token in MongoDB
        const token = await Token.findOne({ token: authenticate, email });

        const user = await department.findById(token.userID)

        if(!user){
            const htmlResponse = `
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f2f2f2;
                            text-align: center;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #dc3545;
                        }
                        p {
                            font-size: 18px;
                        }
                        .error-message {
                            background-color: #f8d7da;
                            color: #721c24;
                            border: 1px solid #f5c6cb;
                            padding: 10px;
                            border-radius: 5px;
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Error</h1>
                        <div class="error-message">
                            <p>User not found</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            res.setHeader('Content-Type', 'text/html');
            return res.status(400).send(htmlResponse);
        }

        if (!token) {
            const htmlResponse = `
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f2f2f2;
                            text-align: center;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #dc3545;
                        }
                        p {
                            font-size: 18px;
                        }
                        .error-message {
                            background-color: #f8d7da;
                            color: #721c24;
                            border: 1px solid #f5c6cb;
                            padding: 10px;
                            border-radius: 5px;
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Error</h1>
                        <div class="error-message">
                            <p>Authetication failed.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            res.setHeader('Content-Type', 'text/html');
            return res.status(400).send(htmlResponse);
        }

        // Check if token is expired
        if (token.expiration < new Date()) {
            const htmlResponse = `
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f2f2f2;
                            text-align: center;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #dc3545;
                        }
                        p {
                            font-size: 18px;
                        }
                        .error-message {
                            background-color: #f8d7da;
                            color: #721c24;
                            border: 1px solid #f5c6cb;
                            padding: 10px;
                            border-radius: 5px;
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Error</h1>
                        <div class="error-message">
                            <p>Authentication expired. Please request a new link.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            res.setHeader('Content-Type', 'text/html');
            return res.status(400).send(htmlResponse);
        }

        // Check if token has already been used
        if (token.used) {
            const htmlResponse = `
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f2f2f2;
                            text-align: center;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #dc3545;
                        }
                        p {
                            font-size: 18px;
                        }
                        .error-message {
                            background-color: #f8d7da;
                            color: #721c24;
                            border: 1px solid #f5c6cb;
                            padding: 10px;
                            border-radius: 5px;
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Error</h1>
                        <div class="error-message">
                            <p>This link has already been used.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            res.setHeader('Content-Type', 'text/html');
            return res.status(400).send(htmlResponse);
        }

        // Mark token as used
        token.used = true;
        await token.save();

        //update user email
        user.email = email
        await user.save();

        // Return HTML response indicating success
        const htmlResponse = `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                        text-align: center;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #007bff;
                    }
                    p {
                        font-size: 18px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Email Successfully Changed!</h1>
                    <p>Your email address ${email} has been successfully updated.</p>
                    <p>Thank you for using our service.</p>
                </div>
            </body>
            </html>
        `;

        // Set content type to HTML
        res.setHeader('Content-Type', 'text/html');

        // Send HTML response
        return res.status(200).send(htmlResponse);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerDepartment,
    loginDepartment,
    getSingleDepartment,
    handleUpdateEmail,
    updateAndAuthenticateEmail,
}