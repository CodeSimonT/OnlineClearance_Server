const express = require('express');
const router = express.Router();

const userAuthenticationToken = require('../../controllers/authentication/userAuthenticationToken');
const { handleGetActiveterm } = require('../../controllers/activeClearanceControllers/term');

router.get('/osc/api/get/activeterm', userAuthenticationToken, handleGetActiveterm )

module.exports = router;