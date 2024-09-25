const department = require('../../model/usersModel/departmentModel');
const activeRequestSchema = require('../../model/activeRequestModel/activeRequest');
const Token = require('../../model/token'); 
const activeTermAndClearanceModel = require('../../model/activeClearance/activeTermAndClearance');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
                    email:req.body.email,
                    password:hash,
                    activeRequest:'',
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

const handleGetAllDepartment = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get the page number from query, default to 1
        const limit = parseInt(req.query.limit) || 10; // Get the limit from query, default to 10
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        const totalDepartments = await department.countDocuments(); // Get the total number of documents
        const totalPages = Math.ceil(totalDepartments / limit); // Calculate the total number of pages

        const departmentList = await department.find().skip(skip).limit(limit); // Fetch the paginated data

        if (!departmentList.length) {
            return res.status(404).json({ message: 'No department found' });
        }

        let filteredData = departmentList.map((data) => ({
            _id: data._id,
            department: data.department,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email
        }));

        return res.status(200).json({
            departments: filteredData,
            currentPage: page,
            totalPages: totalPages,
            totalDepartments: totalDepartments
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const handleUpdateInformation = async (req, res) => {
    try {
        const { id } = req.params;
        const filteredBody = Object.fromEntries(
            Object.entries(req.body).filter(([key, value]) => value !== null && value !== undefined && value !== '')
        );

        await department.findByIdAndUpdate(id, filteredBody);

        return res.status(201).json({ message: 'Updated successfully', data: filteredBody });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

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

const getSingleDepartmentData = async(req,res)=>{
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

const updatePassword = async(req,res)=>{
    try {
        const { password, userID } = req.body;

        if(!password || !userID){
            return res.status(401).json({message:'No credentials found'})
        }
        
        const saltRounds = 10;

        bcrypt.hash(password, saltRounds, async function(err, hash) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            try {
                await department.findByIdAndUpdate(userID,{password:hash})

                return res.status(201).json({ message: 'Password updated successfully' });
            } catch (error) {
                return res.status(500).json({ message: error.message });
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const handleUploadRequiredSignature = async (req, res) => {
    try {
        // Delete the existing document
        await activeTermAndClearanceModel.deleteMany({});

        // Create the new document
        await activeTermAndClearanceModel.create(req.body);

        return res.status(201).json({ message: 'Success' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const handleGetActiveRequest = async (req, res) => {
    try {
        const { id, page = 1, limit = 10 } = req.query;

        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);

        const requestList = await activeRequestSchema.findById(id);

        if (!requestList) {
            return res.status(404).json({ message: "List not found" });
        }

        const totalRequests = requestList.request.length;
        const totalPages = Math.ceil(totalRequests / limitInt);
        const paginatedRequests = requestList.request.slice((pageInt - 1) * limitInt, pageInt * limitInt);

        return res.status(200).json({
            requests: paginatedRequests,
            currentPage: pageInt,
            totalPages: totalPages,
            totalRequests: totalRequests
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const handleResetPassword = async (req, res) => {
    try {
        const { department:departmentName } = req.query;
        const user = await department.findOne({ department:departmentName });

        if (!user) {
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
                            <p>User not found!</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            res.setHeader('Content-Type', 'text/html');
            return res.status(400).send(htmlResponse);
        }

        const serverUrl = process.env.SERVER_URL; // Pass the server URL to the frontend

        const htmlForm = `
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
                        color: #7D0A0A;
                    }
                    p {
                        font-size: 18px;
                    }
                    .form-group {
                        margin-bottom: 15px;
                    }
                    .form-group label {
                        display: block;
                        text-align: left;
                        margin-bottom: 5px;
                        color:#484848ce;
                    }
                    .form-group input {
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                    }
                    .form-group button {
                        background-color: #7D0A0A;
                        color: #fff;
                        padding: 10px 15px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Reset Password</h1>
                    <form id="resetPasswordForm">
                        <div class="form-group">
                            <label for="password">New Password</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" required>
                        </div>
                        <div class="form-group">
                            <button type="button" onclick="resetPassword()">Reset Password</button>
                        </div>
                    </form>
                </div>
                <script>
                    async function resetPassword() {
                        const password = document.getElementById('password').value;
                        const confirmPassword = document.getElementById('confirmPassword').value;
                        
                        if (password !== confirmPassword) {
                            alert('Passwords do not match');
                            return;
                        }

                        const response = await fetch('${serverUrl}/osc/api/reset-department-password', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ department: '${departmentName}', password: password })
                        });

                        const result = await response.json();
                        if (response.ok) {
                            alert('Password reset successfully');
                            window.close();
                        } else {
                            alert('Error: ' + result.message);
                        }
                    }
                </script>
            </body>
            </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(htmlForm);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const resetStudentPass = async (req, res) => {
    try {
        const { department:departmentName, password } = req.body;
        const user = await department.findOne({ department:departmentName });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const saltRounds = 10;

        bcrypt.hash(password, saltRounds, async function (err, hash) {
            if (err) {
              return res.status(500).json({ message: err.message });
            }
            
            user.password = hash;
            await user.save();

            return res.status(200).json({ message: 'Password reset successfully' });
          });

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
    updatePassword,
    handleGetAllDepartment,
    handleUpdateInformation,
    handleUploadRequiredSignature,
    getSingleDepartmentData,
    handleGetActiveRequest,
    handleResetPassword,
    resetStudentPass
}