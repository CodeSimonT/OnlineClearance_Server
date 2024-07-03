const mongoose = require('mongoose');

const clearanceList = mongoose.Schema(
    {
        list:{
            type:Array,
            required:false,
            default:[]
        }
    },
    {
        timestamps:true
    }
)

const clearanceListModel = mongoose.model('clearanceListModel', clearanceList)

module.exports = clearanceListModel;