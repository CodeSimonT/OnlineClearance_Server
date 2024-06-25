const express = require('express');
const router = express.Router();

const { registerDepartment } = require('../../controllers/usersController/departmentController');

router.post('/osc/api/registerDepartment', registerDepartment);

module.exports = router;