const activeTermAndClearanceModel = require('../../model/activeClearance/activeTermAndClearance');
const activeClearanceModel = require('../../model/clearance/activeClearance');
const clearanceListModel = require('../../model/clearance/clearanceList');
const department = require('../../model/usersModel/departmentModel');
const studentList = require('../../model/usersModel/studentModel')

const handleGetActiveterm = async (req, res) => {
    try {
        const { userID } = req.query;
        
        const user = await studentList.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const activeTerm = await activeTermAndClearanceModel.find();
        if (!activeTerm) return res.status(404).json({ message: 'No active term' });
        
        const departments = await department.find();
        if (!departments) return res.status(404).json({ message: 'No department found' });
        
        const departmentID = departments.map(data => ({
            departmentId: data._id,
            deficiency: '',
            additionInformation: '',
            status: ''
        }));

        const createClearance = async (term,active) => {
            const requiredClearance = await activeClearanceModel.create({
                term,
                requiredDepartments: departmentID,
                status: 'On-going'
            });
            user.activeClearance = requiredClearance._id;
            await user.save();

            const clearanceHistory = await clearanceListModel.findById({_id:user.clearanceList})

            const newActiveData = {
                _id:active._id,
                term:active.term,
                requiredDepartments:active.requiredDepartments,
                status:active.status
            }

                if(!clearanceHistory && !active){
                    const newClearance = await clearanceListModel.create({list:['']})

                    user.clearanceList = newClearance._id
                    await user.save();

                }else if(!clearanceHistory && active){
                    const newClearance = await clearanceListModel.create({list:[newActiveData]})

                    user.clearanceList = newClearance._id
                    await user.save();
                }else if(clearanceHistory && active){

                    clearanceHistory.list.push(newActiveData);
                    clearanceHistory.markModified('list');
                    await clearanceHistory.save();
                }
            return res.status(201).json({ message: 'Success' });
        };

        const processClearance = async (term) => {
            let active;

            if(user.activeClearance !== ''){
                active = await activeClearanceModel.findById({_id:user.activeClearance});
            }else{
                active = false;
            }
            
            if (active) {
                if (active.term === term) {
                    active.status = activeTerm[0].isActive ? 'On-going' : 'Closed';
                    await active.save();

                    return res.status(201).json({ message: 'Success' });
                } else {
                    return createClearance(term,active);
                }
            } else {
                return createClearance(term,active);
            }
        };

        if (user.academicLevel.toLowerCase() === 'college') {
            const term = user.term.toLowerCase() === 'regular' ? activeTerm[0].term.collegeRegular : activeTerm[0].term.collegeAsean;
            return processClearance(term);
        } else if (user.academicLevel.toLowerCase() === 'shs') {
            return processClearance(activeTerm[0].term.shsTerm);
        }

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    handleGetActiveterm
}