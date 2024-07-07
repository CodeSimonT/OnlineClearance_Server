const activeTermAndClearanceModel = require('../../model/activeClearance/activeTermAndClearance');
const activeRequestSchema = require('../../model/activeRequestModel/activeRequest');
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
            departmentName:data.department,
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
            const isCompleted = active?.requiredDepartments?.every(data => data.status !== '' && data.status !== 'pending');

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

const handleSendRequestClearance = async (req, res) => {
    try {
        const { deptID, clearanceID, userID } = req.body;

        const designee = await department.findById(deptID);
        const requestor = await studentList.findById(userID);

        if (!designee) return res.status(404).json({ message: 'Department not found' });
        if (!requestor) return res.status(404).json({ message: 'User not found' });

        const studentClearance = await activeClearanceModel.findById(requestor.activeClearance);

        if (!studentClearance || studentClearance.status === 'Closed') {
            return res.status(401).json({ message: 'No active clearance' });
        }

        const requestList = await activeRequestSchema.findById(designee.activeRequest);
        if (!requestList) return res.status(404).json({ message: 'List not found' });

        if (requestList.request.some(data => data.clearanceID === clearanceID)) {
            return res.status(403).json({ message: 'You have already sent a request' });
        }

        const departmentOrder = ['SSG', 'IT/Property', 'Accounting', 'Registrar', 'Academic'];
        const currentDeptIndex = departmentOrder.indexOf(designee.department);

        if (currentDeptIndex > 0) {
            const previousDepartment = departmentOrder[currentDeptIndex - 1];
            const requiredDepartment = studentClearance.requiredDepartments.find(
                data => data.departmentName === previousDepartment
            );

            if (requiredDepartment.status === '') {
                return res.status(403).json({
                    message: `You need the ${previousDepartment} sign before you proceed to other departments`
                });
            }
        }

        requestList.request.push({
            requestorName: requestor.name,
            usn:requestor.usn,
            clearanceID,
            term:studentClearance.term,
            status: 'Pending'
        });

        requestList.markModified('request');
        await requestList.save();

        return res.status(201).json({ message: 'Sent successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const handleGetDeficiency = async(req,res)=>{
    try {
        const {id} = req.query;

            const clearance = await activeClearanceModel.findById(id)

                if(!clearance){
                    return res.status(404).json({message:"Clearance not found"})
                }
                
        return res.status(201).json(clearance.requiredDepartments)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const addDeficiency = async (req, res) => {
    try {
        const { clearanceID, departmentID, itemsOfDeficiency, information } = req.body;
        
        const activeClearance = await activeClearanceModel.findById(clearanceID);
        const departmentOwner = await department.findById(departmentID);

        if (!activeClearance || !departmentOwner) {
            return res.status(404).json({ message: "The clearance or department is not found!" });
        }

        const toUpdate = activeClearance.requiredDepartments.find(data => data.departmentName === departmentOwner.department);

        if (!toUpdate) {
            return res.status(404).json({ message: "Department is not found!" });
        }

        toUpdate.deficiency = itemsOfDeficiency;
        toUpdate.additionalInformation = information;

        activeClearance.markModified('requiredDepartments');
        await activeClearance.save();

        return res.status(201).json({ message: "Success" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const handleApproveRequest = async (req, res) => {
    try {
        const { clearanceID, departmentID } = req.body;

        // Fetch the clearance and designee (department)
        const clearance = await activeClearanceModel.findById(clearanceID);
        const designee = await department.findById(departmentID);

        if (!clearance || !designee) {
            return res.status(404).json({ message: "Clearance or department is not found" });
        }

        // Fetch the clearance request associated with the department
        const clearanceRequest = await activeRequestSchema.findById(designee.activeRequest);
        if (!clearanceRequest) {
            return res.status(404).json({ message: "Request collection not found" });
        }

        // Update the status of the required department
        const requiredDep = clearance.requiredDepartments.find(data => data.departmentName === designee.department);
        if (!requiredDep) {
            return res.status(404).json({ message: "Department in clearance is not found" });
        }

        requiredDep.status = 'Completed';
        requiredDep.deficiency = '';
        requiredDep.additionalInformation = ''; // Changed to match the previous corrected term

        clearance.markModified('requiredDepartments');
        await clearance.save();

        // Remove the request from the clearance request list
        clearanceRequest.request = clearanceRequest.request.filter(data => data.clearanceID !== clearanceID);
        clearanceRequest.markModified('request');
        await clearanceRequest.save();

        return res.status(201).json({ message: "Success" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getClearanceHistory = async(req,res)=>{
    try {
        const { id, page = 1, limit = 10 } = req.query;

        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);

            const studentData = await studentList.findById(id);

                if(!studentData){
                    return res.status(404).json({message:"Student not found"})
                }

        const clearanceHistory = await clearanceListModel.findById(studentData.clearanceList)

                if(!clearanceHistory){
                    return res.status(404).json({message:"History not found"})
                }


        const totalRequests = clearanceHistory.list.length;
        const totalPages = Math.ceil(totalRequests / limitInt);
        const paginatedRequests = clearanceHistory.list.slice((pageInt - 1) * limitInt, pageInt * limitInt);

        return res.status(200).json({
            requests: paginatedRequests,
            currentPage: pageInt,
            totalPages: totalPages,
            totalRequests: totalRequests
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    handleGetActiveterm,
    handleEndTerm,
    checkActiveTerm,
    handleSendRequestClearance,
    handleGetDeficiency,
    addDeficiency,
    handleApproveRequest,
    getClearanceHistory
}