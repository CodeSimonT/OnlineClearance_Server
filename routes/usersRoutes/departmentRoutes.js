const express = require('express');
const router = express.Router();

const { registerDepartment,loginDepartment } = require('../../controllers/usersController/departmentController');

router.post('/osc/api/registerDepartment', registerDepartment);
router.post('/osc/api/loginDepartment', loginDepartment);

module.exports = router;