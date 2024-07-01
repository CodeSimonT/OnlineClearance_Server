const express = require('express');
const router = express.Router();

const { registerDepartment,
        loginDepartment,
        getSingleDepartment,
        handleUpdateEmail,
        updateAndAuthenticateEmail,
        updatePassword,
        handleGetAllDepartment,
        handleUpdateInformation
    } = require('../../controllers/usersController/departmentController');
const adminAuthenticateToken = require('../../controllers/authentication/adminAuthenticateToken')

router.post('/osc/api/registerDepartment', registerDepartment);
router.post('/osc/api/loginDepartment', loginDepartment);
router.post('/osc/api/changeEmail', adminAuthenticateToken, handleUpdateEmail);

router.get('/osc/api/get/single/department', adminAuthenticateToken, getSingleDepartment)
router.get('/osc/api/authenticateEmail', updateAndAuthenticateEmail);
router.get('/osc/api/get/all/department', adminAuthenticateToken, handleGetAllDepartment);

router.put('/osc/api/updatepassword',adminAuthenticateToken, updatePassword);
router.put('/osc/api/handleUpdateInformation/:id',adminAuthenticateToken, handleUpdateInformation);

module.exports = router;