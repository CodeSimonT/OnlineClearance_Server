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
    term:{
      type:String,
      required:true,
      default:""
    },
    clearanceList:{
      type:String,
      required:true,
      default:""
    },
    activeClearance:{
      type:String,
      required:false,
      default:""
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
