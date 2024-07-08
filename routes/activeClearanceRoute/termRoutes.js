const express = require('express');
const router = express.Router();

const userAuthenticationToken = require('../../controllers/authentication/userAuthenticationToken');
const { handleGetActiveterm,
        handleEndTerm,
        checkActiveTerm,
        handleSendRequestClearance,
        handleGetDeficiency, 
        addDeficiency,
        handleApproveRequest,
        getClearanceHistory,
        handleClearancePreview
    } = require('../../controllers/activeClearanceControllers/term');
const adminAuthenticateToken = require('../../controllers/authentication/adminAuthenticateToken');

router.get('/osc/api/get/activeterm', userAuthenticationToken, handleGetActiveterm )
router.get('/osc/api/get/checkActiveTerm', adminAuthenticateToken, checkActiveTerm )
router.get('/osc/api/get/deficiency', adminAuthenticateToken, handleGetDeficiency )
router.get('/osc/api/get/studentdeficiency', userAuthenticationToken, handleGetDeficiency )
router.get('/osc/api/get/clearanceHistory', userAuthenticationToken, getClearanceHistory )
router.get('/clearance/preview', handleClearancePreview )

router.put('/osc/api/delete/handleEndTerm', adminAuthenticateToken, handleEndTerm )

router.post('/osc/api/post/sendRequestClearance', userAuthenticationToken, handleSendRequestClearance )
router.post('/osc/api/post/addDeficiency', adminAuthenticateToken, addDeficiency )
router.post('/osc/api/post/approveRequest', adminAuthenticateToken, handleApproveRequest )

module.exports = router;