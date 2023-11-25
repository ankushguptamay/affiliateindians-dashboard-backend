const db = require('../../Models');
const AffiliateUserIdRequest = db.affiliateUserIdRequest;
const User = db.user;
const { Op } = require('sequelize');

exports.sendAffiliateUserIdRequest = async (req, res) => {
    try {
        const isRequest = await AffiliateUserIdRequest.findOne({
            where: {
                userId: req.user.id
            },
            paranoid: false
        });
        if (isRequest) {
            return res.status(403).send({
                success: false,
                message: `Request already present!`
            });
        }
        await AffiliateUserIdRequest.create({
            status: "PENDING",
            userId: req.user.id
        });
        res.status(201).send({
            success: true,
            message: `Account Details added successfully!`
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
        const totalRequest = await AffiliateUserIdRequest.count();
        // All Request
        const request = await AffiliateUserIdRequest.findAll({
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
                id: req.params.id
            }
        });
        if (!isRequest) {
            return res.status(403).send({
                success: false,
                message: `Request is not present!`
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
        if (isCode.length == 0) {
            code = "AL" + 1000;
        } else {
            let lastCode = isCode[isCode.length - 1];
            let lastDigits = lastCode.affiliateUserId.substring(2);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "AL" + incrementedDigits;
        }
        await isRequest.update({
            ...isRequest,
            affiliateUserId: code,
            status: "ACCEPT"
        });
        const user = await User.findOne({
            where: {
                id: isRequest.userId
            }
        });
        await user.update({
            ...user,
            affiliateUserId: code
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
                id: req.params.id
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
                id: req.params.id
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