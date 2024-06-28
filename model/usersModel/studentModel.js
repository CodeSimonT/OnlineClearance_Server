const mongoose = require("mongoose");

const studentListModel = mongoose.Schema(
  {
    usn: {
      type: String,
      required: true,
      default: "",
    },
    name: {
      type: String,
      required: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      default: "",
    },
    program: {
      type: String,
      required: true,
      default: "",
    },
    academicLevel: {
      type: String,
      required: true,
      default: "",
    },
    password: {
      type: String,
      required: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
const studentList = mongoose.model("studentList", studentListModel);
module.exports = studentList;
