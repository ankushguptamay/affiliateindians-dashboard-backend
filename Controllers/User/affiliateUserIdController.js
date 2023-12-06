const db = require('../../Models');
const AffiliateUserIdRequest = db.affiliateUserIdRequest;
const Course = db.course;
const Assignment = db.assignment;
const User = db.user;
const { Op } = require('sequelize');

exports.sendAffiliateUserIdRequest = async (req, res) => {
    try {
        const assignmentId = req.params.assignmentId;
        const assignment = await Assignment.findOne({
            where: {
                id: assignmentId
            }
        });
        const adminId = assignment.adminId;
        const isRequest = await AffiliateUserIdRequest.findOne({
            where: {
                userId: req.user.id,
                adminId: adminId
            },
            paranoid: false
        });
        if (isRequest) {
            return res.status(403).send({
                success: false,
                message: `Request already present!`
            });
        }
        // Generating Code
        let code;
        const isCode = await AffiliateUserIdRequest.findAll({
            order: [
                ['createdAt', 'ASC']
            ],
            paranoid: false
        });
        if (isCode.length === 0) {
            code = "ALID" + 1000;
        } else {
            let lastCode = isCode[isCode.length - 1];
            let lastDigits = lastCode.aid.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "ALID" + incrementedDigits;
        }
        await AffiliateUserIdRequest.create({
            status: "PENDING",
            userId: req.user.id,
            aid: code,
            adminId: adminId
        });
        res.status(201).send({
            success: true,
            message: `Affiliate Id request send successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getAffiliateUserIdRequestForAdmin = async (req, res) => {
    try {
        const { page, limit } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        // Count All request
        const totalRequest = await AffiliateUserIdRequest.count({
            where: {
                adminId: req.admin.id
            }
        });
        // All Request
        const request = await AffiliateUserIdRequest.findAll({
            where: {
                adminId: req.admin.id
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: {
                model: User,
                as: "user"
            }
        });
        res.status(201).send({
            success: true,
            message: `Request fetched successfully!`,
            totalPage: Math.ceil(totalRequest / recordLimit),
            currentPage: currentPage,
            data: request
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.acceptAffiliateUserIdRequest = async (req, res) => {
    try {
        const isRequest = await AffiliateUserIdRequest.findOne({
            where: {
                id: req.params.id,
                adminId: req.admin.id
            }
        });
        if (!isRequest) {
            return res.status(403).send({
                success: false,
                message: `Request is not present!`
            });
        }
        // store code
        await isRequest.update({
            ...isRequest,
            status: "ACCEPT"
        });
        res.status(201).send({
            success: true,
            message: `Request accepted successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.blockAffiliateUserIdRequest = async (req, res) => {
    try {
        const isRequest = await AffiliateUserIdRequest.findOne({
            where: {
                id: req.params.id,
                adminId: req.admin.id
            }
        });
        if (!isRequest) {
            return res.status(403).send({
                success: false,
                message: `Request is not present!`
            });
        }
        await isRequest.update({
            ...isRequest,
            status: "BLOCK"
        });
        res.status(201).send({
            success: true,
            message: `Request blocked successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.unblockAffiliateUserIdRequest = async (req, res) => {
    try {
        const isRequest = await AffiliateUserIdRequest.findOne({
            where: {
                id: req.params.id,
                adminId: req.admin.id
            }
        });
        if (!isRequest) {
            return res.status(403).send({
                success: false,
                message: `Request is not present!`
            });
        }
        await isRequest.update({
            ...isRequest,
            status: "UNBLOCK"
        });
        res.status(201).send({
            success: true,
            message: `Request unblocked successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getAffiliateUserIdForUser = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findOne({
            where: {
                id: courseId
            }
        });
        const adminId = course.adminId;
        const isRequest = await AffiliateUserIdRequest.findOne({
            where: {
                userId: req.user.id,
                adminId: adminId
            }
        });
        if (!isRequest) {
            return res.status(403).send({
                success: false,
                message: `Affiliate Id is not present!`
            });
        }
        res.status(201).send({
            success: true,
            message: `Affiliate Id fetched successfully!`,
            data: isRequest
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};