const mongoose = require('mongoose');

const departmentModel = mongoose.Schema(
    {
        department:{
            type:String,
            required:true
        },
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        },
        email:{
            type:Object,
            required:false,
            default:''
        },
        password:{
            type:String,
            required:true
        },
        activeRequest:{
            type:String,
            required:false,
            default:''
        },
    },
    {
        timestamps:true
    }
)

const department = mongoose.model('department', departmentModel);
module.exports = department;