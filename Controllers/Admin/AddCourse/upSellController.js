const { Op } = require('sequelize');
const db = require('../../../Models');
const { upSellValidation } = require("../../../Middlewares/Validate/validateCourse");
const Course = db.course;
const UpSell = db.upSell;

exports.addUpSell = async (req, res) => {
    try {
        // Validate Body
        const { error } = upSellValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { buttonText, buttonLink, courseId } = req.body;
        // Check is this course create by this admin, superAdmin can add any course
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
                message: "Course is not present!"
            });
        };
        // Create upSell
        await UpSell.create({
            courseId: courseId,
            buttonLink: buttonLink,
            buttonText: buttonText,
            adminId: adminId
        });
        res.status(201).send({
            success: true,
            message: `UpSell created successfully! and added to course ${course.title}!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.deleteUpSell = async (req, res) => {
    try {
        // Check is this upsell create by this admin, superAdmin can delete any upSell
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const upSell = await UpSell.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!upSell) {
            return res.status(400).send({
                success: false,
                message: "UpSell is not present!"
            });
        };
        await upSell.destroy({ force: true });
        res.status(201).send({
            success: true,
            message: `UpSell deleted successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};