const { Op } = require('sequelize');
const db = require('../../../Models');
const { upSellValidation } = require("../../../Middlewares/Validate/validateCourse");
const Lesson = db.lesson;
const UpSell = db.upSell;

exports.addUpSell = async (req, res) => {
    try {
        // Validate Body
        const { error } = upSellValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { buttonText, buttonLink, lessonId } = req.body;
        // Check is this lesson create by this admin, superAdmin can add any lesson
        const adminId = req.admin.id;
        const condition = [{ id: lessonId }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const lesson = await Lesson.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!lesson) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        };
        // Create upSell
        await UpSell.create({
            lessonId: lessonId,
            buttonLink: buttonLink,
            buttonText: buttonText,
            adminId: adminId
        });
        res.status(201).send({
            success: true,
            message: `UpSell created successfully! and added to lesson ${lesson.lessonName}!`
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