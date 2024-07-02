const studentList = require("../../model/usersModel/studentModel");
const clearanceListModel = require("../../model/usersModel/clearanceList")

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Token = require("../../model/token");
const emailSender = require("../emailSender");

require('dotenv').config();

const createStudent = async (req, res) => {
  try {
    const saltRounds = 10;
    const defaultPassword = "student123";

    const { usn, name, email, program, academicLevel, term } = req.body;

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
        const clearanceList = await clearanceListModel.create({list:['']})

        await studentList.create({
          usn,
          name,
          email,
          program,
          academicLevel,
          clearanceList: clearanceList._id,
          term,
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

    // Find the student by name
    const student = await studentList.findOne({ usn: usn });
    if (!student) {
      return res.status(401).json({ message: "usn not registered!" });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate token
    const token = jwt.sign(
      { userID: student._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Send the token as a response
    res.status(200).json({ token, userID: student._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSingleData = async(req,res)=>{
  try {
    const {userID} = req.query;
    console.log(userID)
    const student = await studentList.findById(userID)

      if(!student){
        return res.status(404).json({message:'Student not found'})
      }
      
      const filteredData = {
        _id:student._id,
        usn:student.usn,
        name:student.name,
        email:student.email,
        program:student.program,
        term:student.term,
        clearanceList:student.clearanceList,
        academicLevel:student.academicLevel
      }

      return res.status(201).json(filteredData)
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

const handleUpdateEmail = async (req, res) => {
  try {
      const { email, userID } = req.body;

      const user = await studentList.findById(userID);
      if (!user) {
          return res.status(404).json({ message: 'Student not found!' });
      }

      // Generate token with expiration of 5 minutes
      const token = jwt.sign(
          { userID: user._id },
          process.env.EMAIL_ACCESS_TOKEN,
          { expiresIn: '5m' }
      );

      // Store token in MongoDB
      await Token.create({ token, email, userID, expiration: new Date(Date.now() + 5 * 60 * 1000) });

      const url = `${process.env.SERVER_URL}/osc/api/authenticateStudentEmail?authenticate=${token}&email=${email}`;

      emailSender(url, email);

      return res.status(201).json({ message: 'A link to change your email address has been sent to your email.' });
  } catch (error) {
      return res.status(500).json({ message: error.message });
  }
};

const updateAndAuthenticateEmail = async (req, res) => {
  try {
      const { authenticate, email } = req.query;

      // Find token in MongoDB
      const token = await Token.findOne({ token: authenticate, email });

      const user = await studentList.findById(token.userID)

      if(!user){
          const htmlResponse = `
              <html>
              <head>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          background-color: #f2f2f2;
                          text-align: center;
                          padding: 20px;
                      }
                      .container {
                          max-width: 600px;
                          margin: 0 auto;
                          background-color: #ffffff;
                          padding: 20px;
                          border-radius: 8px;
                          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                      }
                      h1 {
                          color: #dc3545;
                      }
                      p {
                          font-size: 18px;
                      }
                      .error-message {
                          background-color: #f8d7da;
                          color: #721c24;
                          border: 1px solid #f5c6cb;
                          padding: 10px;
                          border-radius: 5px;
                          margin-bottom: 10px;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <h1>Error</h1>
                      <div class="error-message">
                          <p>User not found</p>
                      </div>
                  </div>
              </body>
              </html>
          `;
          res.setHeader('Content-Type', 'text/html');
          return res.status(400).send(htmlResponse);
      }

      if (!token) {
          const htmlResponse = `
              <html>
              <head>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          background-color: #f2f2f2;
                          text-align: center;
                          padding: 20px;
                      }
                      .container {
                          max-width: 600px;
                          margin: 0 auto;
                          background-color: #ffffff;
                          padding: 20px;
                          border-radius: 8px;
                          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                      }
                      h1 {
                          color: #dc3545;
                      }
                      p {
                          font-size: 18px;
                      }
                      .error-message {
                          background-color: #f8d7da;
                          color: #721c24;
                          border: 1px solid #f5c6cb;
                          padding: 10px;
                          border-radius: 5px;
                          margin-bottom: 10px;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <h1>Error</h1>
                      <div class="error-message">
                          <p>Authetication failed.</p>
                      </div>
                  </div>
              </body>
              </html>
          `;
          res.setHeader('Content-Type', 'text/html');
          return res.status(400).send(htmlResponse);
      }

      // Check if token is expired
      if (token.expiration < new Date()) {
          const htmlResponse = `
              <html>
              <head>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          background-color: #f2f2f2;
                          text-align: center;
                          padding: 20px;
                      }
                      .container {
                          max-width: 600px;
                          margin: 0 auto;
                          background-color: #ffffff;
                          padding: 20px;
                          border-radius: 8px;
                          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                      }
                      h1 {
                          color: #dc3545;
                      }
                      p {
                          font-size: 18px;
                      }
                      .error-message {
                          background-color: #f8d7da;
                          color: #721c24;
                          border: 1px solid #f5c6cb;
                          padding: 10px;
                          border-radius: 5px;
                          margin-bottom: 10px;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <h1>Error</h1>
                      <div class="error-message">
                          <p>Authentication expired. Please request a new link.</p>
                      </div>
                  </div>
              </body>
              </html>
          `;
          res.setHeader('Content-Type', 'text/html');
          return res.status(400).send(htmlResponse);
      }

      // Check if token has already been used
      if (token.used) {
          const htmlResponse = `
              <html>
              <head>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          background-color: #f2f2f2;
                          text-align: center;
                          padding: 20px;
                      }
                      .container {
                          max-width: 600px;
                          margin: 0 auto;
                          background-color: #ffffff;
                          padding: 20px;
                          border-radius: 8px;
                          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                      }
                      h1 {
                          color: #dc3545;
                      }
                      p {
                          font-size: 18px;
                      }
                      .error-message {
                          background-color: #f8d7da;
                          color: #721c24;
                          border: 1px solid #f5c6cb;
                          padding: 10px;
                          border-radius: 5px;
                          margin-bottom: 10px;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <h1>Error</h1>
                      <div class="error-message">
                          <p>This link has already been used.</p>
                      </div>
                  </div>
              </body>
              </html>
          `;
          res.setHeader('Content-Type', 'text/html');
          return res.status(400).send(htmlResponse);
      }

      // Mark token as used
      token.used = true;
      await token.save();

      //update user email
      user.email = email
      await user.save();

      // Return HTML response indicating success
      const htmlResponse = `
          <html>
          <head>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f2f2f2;
                      text-align: center;
                      padding: 20px;
                  }
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      background-color: #ffffff;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  h1 {
                      color: #007bff;
                  }
                  p {
                      font-size: 18px;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>Email Successfully Changed!</h1>
                  <p>Your email address ${email} has been successfully updated.</p>
                  <p>Thank you for using our service.</p>
              </div>
          </body>
          </html>
      `;

      // Set content type to HTML
      res.setHeader('Content-Type', 'text/html');

      // Send HTML response
      return res.status(200).send(htmlResponse);
  } catch (error) {
      return res.status(500).json({ message: error.message });
  }
};

const updatePassword = async(req,res)=>{
  try {
      const { password, userID } = req.body;

      if(!password || !userID){
          return res.status(401).json({message:'No credentials found'})
      }
      
      const saltRounds = 10;

      bcrypt.hash(password, saltRounds, async function(err, hash) {
          if (err) {
              return res.status(500).json({ message: err.message });
          }

          try {
              await studentList.findByIdAndUpdate(userID,{password:hash})

              return res.status(201).json({ message: 'Password updated successfully' });
          } catch (error) {
              return res.status(500).json({ message: error.message });
          }
      });
  } catch (error) {
      return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createStudent,
  loginStudent,
  getStudentList,
  deleteStudent,
  getSingleData,
  handleUpdateEmail,
  updateAndAuthenticateEmail,
  updatePassword
};
