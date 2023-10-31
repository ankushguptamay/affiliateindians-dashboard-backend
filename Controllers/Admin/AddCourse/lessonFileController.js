const { Op } = require('sequelize');
const db = require('../../../Models');
const LessonFile = db.lessonFile;
const Lesson = db.lesson;
const { deleteSingleFile } = require("../../../Util/deleteFile");

exports.addBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a Banner!"
            });
        }
        const lessonId = req.params.lessonId;
        const lesson = await Lesson.findOne({ where: { id: lessonId } });
        await LessonFile.create({
            file_FieldName: req.file.fieldname,
            file_Path: req.file.path,
            file_MimeType: req.file.mimetype,
            file_OriginalName: req.file.originalname,
            file_FileName: req.file.filename,
            courseId: lesson.courseId,
            sectionId: lesson.sectionId,
            lessonId: lessonId,
            adminId: req.admin.id
        });
        res.status(201).send({
            success: true,
            message: `Lesson's banner added successfully!`
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

exports.updateBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a Banner!"
            });
        }
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const lessonFile = await LessonFile.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!lessonFile) {
            return res.status(400).send({
                success: false,
                message: "Banner not found!"
            });
        }
        if (lessonFile.file_Path) {
            deleteSingleFile(lessonFile.file_Path);
        }
        await lessonFile.update({
            ...lessonFile,
            file_FieldName: req.file.fieldname,
            file_Path: req.file.path,
            file_MimeType: req.file.mimetype,
            file_OriginalName: req.file.originalname,
            file_FileName: req.file.filename
        });
        res.status(201).send({
            success: true,
            message: `Lesson's banner updated successfully!`
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

exports.addPDF = async (req, res) => {
    try {
        if (req.files.length <= 0) {
            return res.status(400).send({
                success: false,
                message: "Select atleast one PDF!"
            });
        }
        const lessonId = req.params.lessonId;
        const lesson = await Lesson.findOne({ where: { id: lessonId } });
        const fileArray = req.files;
        for (let i = 0; i < fileArray.length; i++) {
            await LessonFile.create({
                file_FieldName: fileArray[i].fieldname,
                file_Path: fileArray[i].path,
                file_MimeType: fileArray[i].mimetype,
                file_OriginalName: fileArray[i].originalname,
                file_FileName: fileArray[i].filename,
                courseId: lesson.courseId,
                sectionId: lesson.sectionId,
                lessonId: lessonId,
                adminId: req.admin.id
            });
        }
        res.status(201).send({
            success: true,
            message: `Lesson's PDF added successfully!`
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

exports.hardDeletePDF = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const lessonFile = await LessonFile.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!lessonFile) {
            return res.status(400).send({
                success: false,
                message: "PDF not found!"
            });
        }
        if (lessonFile.file_Path) {
            deleteSingleFile(lessonFile.file_Path);
        }
        await lessonFile.destroy({ force: true });
        res.status(201).send({
            success: true,
            message: `Lesson's PDF deleted successfully!`
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

exports.addResource = async (req, res) => {
    try {
        if (req.files.length <= 0) {
            return res.status(400).send({
                success: false,
                message: "Select atleast one File!"
            });
        }
        const lessonId = req.params.lessonId;
        const lesson = await Lesson.findOne({ where: { id: lessonId } });
        const fileArray = req.files;
        for (let i = 0; i < fileArray.length; i++) {
            await LessonFile.create({
                file_FieldName: fileArray[i].fieldname,
                file_Path: fileArray[i].path,
                file_MimeType: fileArray[i].mimetype,
                file_OriginalName: fileArray[i].originalname,
                file_FileName: fileArray[i].filename,
                courseId: lesson.courseId,
                sectionId: lesson.sectionId,
                lessonId: lessonId,
                adminId: req.admin.id
            });
        }
        res.status(201).send({
            success: true,
            message: `Lesson's Resource added successfully!`
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

exports.hardDeleteResource = async (req, res) => {
    try {

        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const lessonFile = await LessonFile.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!lessonFile) {
            return res.status(400).send({
                success: false,
                message: "Resource not found!"
            });
        }
        if (lessonFile.file_Path) {
            deleteSingleFile(lessonFile.file_Path);
        }
        await lessonFile.destroy({ force: true });
        res.status(201).send({
            success: true,
            message: `Lesson's Resource deleted successfully!`
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