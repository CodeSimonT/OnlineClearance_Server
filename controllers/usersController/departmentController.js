const department = require('../../model/usersModel/departmentModel');
const activeRequestSchema = require('../../model/activeRequestModel/activeRequest');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const registerDepartment = async (req, res) => {
    try {
        const saltRounds = 10;
        const deFaultPasswords = "admin123";
        console.log(req.body)
        bcrypt.hash(deFaultPasswords, saltRounds, async function(err, hash) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            console.log('fck programming')
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

module.exports = {
    registerDepartment
}