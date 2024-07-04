const express = require('express');
const router = express.Router();

const userAuthenticationToken = require('../../controllers/authentication/userAuthenticationToken');
const { handleGetActiveterm,handleEndTerm,checkActiveTerm,handleSendRequestClearance } = require('../../controllers/activeClearanceControllers/term');
const adminAuthenticateToken = require('../../controllers/authentication/adminAuthenticateToken');

router.get('/osc/api/get/activeterm', userAuthenticationToken, handleGetActiveterm )
router.get('/osc/api/get/checkActiveTerm', adminAuthenticateToken, checkActiveTerm )

router.put('/osc/api/delete/handleEndTerm', adminAuthenticateToken, handleEndTerm )

router.post('/osc/api/post/sendRequestClearance', userAuthenticationToken, handleSendRequestClearance )

module.exports = router;