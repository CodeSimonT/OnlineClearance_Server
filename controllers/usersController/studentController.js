const studentList = require("../../model/usersModel/studentModel");
const bcrypt = require("bcrypt");

const createStudent = async (req, res) => {
  try {
    const saltRounds = 10;
    const defaultPassword = "admin123";

    const { usn, name, email, program, academicLevel } = req.body;

    // Email validation function
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Validate email
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    bcrypt.hash(defaultPassword, saltRounds, async function (err, hash) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      try {
        await studentList.create({
          usn: usn,
          name: name,
          email: email,
          program: program,
          academicLevel: academicLevel,
          password: hash, // Set the hashed password here
        });
        return res.status(200).json({ message: "success" });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const getStudentList = async (req, res) => {
  try {
    const students = await studentList.find();
    if (!students.length) {
      return res.status(404).json({ message: "No students found" });
    }
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await studentList.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const loginStudent = async (req, res) => {
  try {
    const { usn, password } = req.body;
    console.log(usn);
    // Find the department by name
    const usnList = await studentlist.findOne({ usn: usn });
    if (!departmentList) {
      return res.status(401).json({ message: "usn not registered!" });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, usn.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate token
    const token = jwt.sign(
      { departmentID: departmentList._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Send the token as a response
    res.status(200).json({ token, usnID: usn._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createStudent,
  loginStudent,
  getStudentList,
  deleteStudent,
};
