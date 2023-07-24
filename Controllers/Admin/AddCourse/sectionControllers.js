const { Op } = require('sequelize');
const db= require('../../../Models');
const Section = db.section
const Lecture = db.lecture;
const { deleteMultiFile } = require("../../../Util/deleteFile")

exports.createSection = async (req, res) => {
    try {
        await Section.create({
            courseId: req.body.courseId,
            sectionName: req.body.sectionName,
            adminId: req.admin.id
        });
        res.status(201).send({
            success: true,
            message: `section added successfully! ID!`
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getAllSectionByCourseId = async (req, res) => {
    try {
        const section = await Section.findAll({
            where: {
                [Op.and]: [
                    { courseId: req.params.courseId }, { adminId: req.admin.id }
                ]
            },
            include: [{
                model: Lecture,
                as: "lessons",
                attributes: ["id", "lessonName"],
                order: [
                    ['createdAt', 'ASC']
                ]
            }],
            order: [
                ['createdAt', 'ASC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "section fetched successfully!",
            data: section
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

// delete file from buuny
// exports.deleteSection = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const section = await Section.findOne({ where: { id: id } });
//         if (!section) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Section is not present!"
//             });
//         };
//         const lectures = await Lecture.findAll({ where: { section_id: id } });
//         const fileArray = [];
//         lectures.map((data) => {
//             fileArray.push(data.file);
//         });
//         deleteMultiFile(fileArray);
//         await section.destroy();
//         res.status(200).send({
//             success: true,
//             message: `Section deleted seccessfully! ID: ${id}`
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send({ success: false,
// err: err.message});
//     }
// };

exports.updateSection = async (req, res) => {
    try {
        const id = req.params.id;
        const section = await Section.findOne({
            where: {
                [Op.and]: [
                    { id: id }, { adminId: req.admin.id }
                ]
            }
        });
        if (!section) {
            return res.status(400).send({
                success: false,
                message: "Section is not present!"
            });
        };
        await section.update({
            ...section,
            sectionName: req.body.sectionName
        });
        res.status(200).send({
            success: true,
            message: `Section Name updated seccessfully!`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.publicSection = async (req, res) => {
    try {
        const id = req.params.id;
        const section = await Section.findOne({
            where: {
                [Op.and]: [
                    { id: id }, { adminId: req.admin.id }
                ]
            }
        });
        if (!section) {
            return res.status(400).send({
                success: false,
                message: "Section is not present!"
            });
        };
        await section.update({
            ...section,
            isPublic: true
        });
        res.status(200).send({
            success: true,
            message: `Section publiced seccessfully!`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};