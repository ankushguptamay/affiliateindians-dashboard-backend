const db = require('../../../Models');
const AffiliateMarketingRatio = db.affiliateMarketingRatio;
const Course = db.course;
const { Op } = require('sequelize');
const { ratioValidation } = require("../../../Middlewares/Validate/validateCourse");

exports.addRatio = async (req, res) => {
    try {
        // Validate Body
        const { error } = ratioValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { referalRatio, adminRatio, ratioName, courseId } = req.body;
        if ((parseFloat(referalRatio) + parseFloat(adminRatio)) !== 100) {
            return res.status(400).send({
                success: false,
                message: "Total ratio value should be equal to 100!"
            });
        }
        const isRatio = await AffiliateMarketingRatio.findOne({
            where: {
                [Op.or]: [
                    { ratioName: ratioName.toUpperCase() },
                    {
                        [Op.or]: [
                            { referalRatio: referalRatio },
                            { adminRatio: adminRatio }
                        ]
                    }
                ]
            },
            paranoid: false
        });
        if (isRatio) {
            return res.status(400).send({
                success: false,
                message: "This Ratio is present or name is present!"
            });
        }
        // Generating Code
        let code;
        const isRatioCode = await AffiliateMarketingRatio.findAll({
            order: [
                ['createdAt', 'ASC']
            ],
            paranoid: false
        });
        if (isRatioCode.length == 0) {
            code = "AFRAT" + 1;
        } else {
            let lastCode = isRatioCode[isRatioCode.length - 1];
            let lastDigits = lastCode.ratioCode.substring(5);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "AFRAT" + incrementedDigits;
        }
        const ratio = await AffiliateMarketingRatio.create({
            referalRatio: referalRatio,
            adminRatio: adminRatio,
            ratioName: ratioName,
            ratioCode: code,
            adminId: req.admin.id
        });
        // only superAdmin can add ratio to all course otherwise admin can only add ratio in those courses which he created
        const adminId = req.admin.id;
        const condition = [{ id: courseId }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const course = await Course.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "This course is not present!"
            });
        }
        await course.update({
            ...course,
            ratioId: ratio.id
        });
        res.status(201).send({
            success: true,
            message: `Ratio created successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getRatio = async (req, res) => {
    try {
        const ratio = await AffiliateMarketingRatio.findAll();
        res.status(201).send({
            success: true,
            message: `Ratio fetched successfully!`,
            data: ratio
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.hardDeleteRatio = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const ratio = await AffiliateMarketingRatio.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!ratio) {
            return res.status(400).send({
                success: false,
                message: "Tag is not present!"
            });
        }
        await ratio.destroy({ force: true });
        res.status(201).send({
            success: true,
            message: `Tag deleted successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};