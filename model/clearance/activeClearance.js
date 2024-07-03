const mongoose = require('mongoose');

const activeClearance = mongoose.Schema(
    {
        term:{
            type:String,
            required:true,
            default:''
        },
        requiredDepartments:{
            type:Array,
            required:true,
            default:''
        },
        status:{
            type:String,
            required:true,
            default:'On-going'
        }
    },
    {
        timestamps:true
    }
)

const activeClearanceModel = mongoose.model('activeClearanceModel', activeClearance)

module.exports = activeClearanceModel;