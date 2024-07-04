const express = require('express');
const router = express.Router();

const userAuthenticationToken = require('../../controllers/authentication/userAuthenticationToken');
const { handleGetActiveterm,handleEndTerm,checkActiveTerm } = require('../../controllers/activeClearanceControllers/term');
const adminAuthenticateToken = require('../../controllers/authentication/adminAuthenticateToken');

router.get('/osc/api/get/activeterm', userAuthenticationToken, handleGetActiveterm )
router.get('/osc/api/get/checkActiveTerm', adminAuthenticateToken, checkActiveTerm )

router.put('/osc/api/delete/handleEndTerm', adminAuthenticateToken, handleEndTerm )

module.exports = router;