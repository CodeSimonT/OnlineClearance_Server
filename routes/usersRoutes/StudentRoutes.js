const express = require("express");
const router = express.Router();

const {
  createStudent,
  loginStudent,
  getStudentList,
  deleteStudent,
} = require("../../controllers/usersController/studentController");

router.post("/osc/api/createStudent", createStudent);
router.post("/osc/api/loginStudent", loginStudent);
router.get("/osc/api/getStudentList", getStudentList);
router.delete("/osc/api/deleteStudent/:id", deleteStudent);

module.exports = router;
