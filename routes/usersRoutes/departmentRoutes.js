const express = require('express');
const router = express.Router();

const { registerDepartment,
        loginDepartment,
        getSingleDepartment,
        handleUpdateEmail,
        updateAndAuthenticateEmail,
        updatePassword
    } = require('../../controllers/usersController/departmentController');
const adminAuthenticateToken = require('../../controllers/authentication/adminAuthenticateToken')

router.post('/osc/api/registerDepartment', registerDepartment);
router.post('/osc/api/loginDepartment', loginDepartment);
router.post('/osc/api/changeEmail', adminAuthenticateToken, handleUpdateEmail);

router.get('/osc/api/get/single/department', adminAuthenticateToken, getSingleDepartment)
router.get('/osc/api/authenticateEmail', updateAndAuthenticateEmail);

router.put('/osc/api/updatepassword',adminAuthenticateToken, updatePassword);

module.exports = router;