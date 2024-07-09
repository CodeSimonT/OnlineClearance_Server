const express = require("express");
const router = express.Router();

const {
  createStudent,
  loginStudent,
  getStudentList,
  deleteStudent,
  getSingleData,
  handleUpdateEmail,
  updateAndAuthenticateEmail,
  updatePassword,
  handleResetPassword,
  resetStudentPass
} = require("../../controllers/usersController/studentController");
const userAuthenticationToken = require("../../controllers/authentication/userAuthenticationToken");

router.post("/osc/api/createStudent", createStudent);
router.post("/osc/api/loginStudent", loginStudent);
router.post("/osc/api/updateStudentEmail", userAuthenticationToken, handleUpdateEmail);
router.post("/osc/api/reset-student-password", resetStudentPass);

router.get("/osc/api/getStudentList", getStudentList);
router.get("/osc/api/getSingleStudent",userAuthenticationToken, getSingleData);
router.get('/osc/api/authenticateStudentEmail', updateAndAuthenticateEmail);
router.get('/osc/form/resetpassword', handleResetPassword);

router.delete("/osc/api/deleteStudent/:id", deleteStudent);

router.put("/osc/api/updateStudentPassword", userAuthenticationToken, updatePassword);

module.exports = router;
