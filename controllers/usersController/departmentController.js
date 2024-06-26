const department = require('../../model/usersModel/departmentModel');
const activeRequestSchema = require('../../model/activeRequestModel/activeRequest');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
        console.log(departmentName)
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
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Send the token as a response
        res.status(200).json({ token, departmentID: departmentList._id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    registerDepartment,
    loginDepartment
}