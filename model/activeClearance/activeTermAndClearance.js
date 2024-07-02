const mongoose = require('mongoose');

const activeTermAndClearance = mongoose.Schema({
    term:{
        type:Object,
        required:true,
        default:''
    },
    isActive:{
        type:Boolean,
        required:true,
        default:true,
    }
})

const activeTermAndClearanceModel = mongoose.model('activeTermAndClearanceModel', activeTermAndClearance);
module.exports = activeTermAndClearanceModel;