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

            //check if clearance is completed
            const isCompleted = active.requiredDepartments.every(data => data.status !== '' && data.status !== 'pending');

            const newActiveData = {
                _id:active._id,
                term:active.term,
                requiredDepartments:active.requiredDepartments,
                status:"Closed",
                completed:isCompleted
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
                } else {
                    createClearance(term,active);
                }
            } else {
                createClearance(term,active);
            }
        };

        //check educational level and term
        if (user.academicLevel.toLowerCase() === 'college') {
            const term = user.term.toLowerCase() === 'regular' ? activeTerm[0].term.collegeRegular : activeTerm[0].term.collegeAsean;
            processClearance(term);
        } else if (user.academicLevel.toLowerCase() === 'shs') {
            processClearance(activeTerm[0].term.shsTerm);
        }

        if(user.activeClearance === ''){
            return res.status(404).json({message:'No active clearance'});
        }

        const studentClearance = await activeClearanceModel.findById({_id:user.activeClearance})

        if(!studentClearance){
            return res.status(404).json({message:'No active clearance'});
        }

        return res.status(201).json(studentClearance)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const handleEndTerm = async (req, res) => {
    try {
        const activeTerms = await activeTermAndClearanceModel.find();

        if (!activeTerms || activeTerms.length === 0) {
            return res.status(404).json({ message: "No active term" });
        }

        const activeTerm = activeTerms[0];
        activeTerm.isActive = false;
        await activeTerm.save();

        //
        const activeClearanceList = await activeClearanceModel.find();

        if (!activeClearanceList || activeClearanceList.length === 0) {
            return res.status(201).json({ message: 'Success' });
        }

        await Promise.all(activeClearanceList.map(async (data) => {
            data.status = 'Closed';
            await data.save();
        }));

        return res.status(201).json({ message: 'Success' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const checkActiveTerm = async(req,res)=>{
    try {
        const activeTerm = await activeTermAndClearanceModel.find();

            if(!activeTerm || activeTerm[0].isActive === false){
                return res.status(201).json({isActive:false});
            }

        return res.status(201).json({isActive:true})
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    handleGetActiveterm,
    handleEndTerm,
    checkActiveTerm
}