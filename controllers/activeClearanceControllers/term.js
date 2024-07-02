const activeTermAndClearanceModel = require('../../model/activeClearance/activeTermAndClearance');
const department = require('../../model/usersModel/departmentModel');
const studentList = require('../../model/usersModel/studentModel')

const handleGetActiveterm = async(req,res)=>{
    try {
        const {userID} = req.query;
        
        const user = await studentList.findById(userID)

            if(!user){
                return res.status(404).json({message:'User not found'})
            }

        const activeTerm = await activeTermAndClearanceModel.find();
            
            if(!activeTerm){
                return res.status(404).json({message:'No active term'})
            }

        const departments = await department.find();
            
            if(!departments){
                return res.status(404).json({message:'No department found'})
            }
        console.log(departments)
        return res.status(201).json('success')
    } catch (error) {
        return res.status(500).json({message:error})
    }
}

module.exports = {
    handleGetActiveterm
}