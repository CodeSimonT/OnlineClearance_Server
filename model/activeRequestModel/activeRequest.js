const mongoose = require('mongoose');

const activeRequest = mongoose.Schema(
    {
        request:{
            type:Array,
            required:false,
            default:[]
        }
    },
    {
        timestamp:true
    }
)

const activeRequestSchema = mongoose.model('activeRequestSchema',activeRequest)
module.exports = activeRequestSchema;