const express = require('express');
const router = express.Router();

const { registerDepartment,loginDepartment,getSingleDepartment } = require('../../controllers/usersController/departmentController');
const adminAuthenticateToken = require('../../controllers/authentication/adminAuthenticateToken')

router.post('/osc/api/registerDepartment', registerDepartment);
router.post('/osc/api/loginDepartment', loginDepartment);

router.get('/osc/api/get/single/department', adminAuthenticateToken, getSingleDepartment)

module.exports = router;