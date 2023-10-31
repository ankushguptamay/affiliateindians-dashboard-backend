const db = require('../../../Models');
const LessonFile = db.lessonFile;
const { deleteSingleFile } = require("../../../Util/deleteFile");

exports.addBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a Banner!"
            });
        }
        const { courseId, sectionId } = req.body;
        const lessonId = req.params.lessonId;
        await LessonFile.create({
            file_FieldName: req.file.fieldname,
            file_Path: req.file.path,
            file_MimeType: req.file.mimetype,
            file_OriginalName: req.file.originalname,
            file_FileName: req.file.filename,
            courseId: courseId,
            sectionId: sectionId,
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
        const lessonFile = await LessonFile.findOne({
            where: {
                id: id,
                adminId: req.admin.id
            }
        });
        if (!lessonFile) {
            return res.status(400).send({
                success: false,
                message: "Banner not found!"
            })
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
        const { courseId, sectionId } = req.body;
        const lessonId = req.params.lessonId;
        const fileArray = req.files;
        for (let i = 0; i < fileArray.length; i++) {
            await LessonFile.create({
                file_FieldName: fileArray[i].fieldname,
                file_Path: fileArray[i].path,
                file_MimeType: fileArray[i].mimetype,
                file_OriginalName: fileArray[i].originalname,
                file_FileName: fileArray[i].filename,
                courseId: courseId,
                sectionId: sectionId,
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

exports.deletePDF = async (req, res) => {
    try {

        const id = req.params.id;
        const lessonFile = await LessonFile.findOne({
            where: {
                id: id,
                adminId: req.admin.id
            }
        });
        if (!lessonFile) {
            return res.status(400).send({
                success: false,
                message: "PDF not found!"
            })
        }
        if (lessonFile.file_Path) {
            deleteSingleFile(lessonFile.file_Path);
        }
        await lessonFile.destroy();
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
        const { courseId, sectionId } = req.body;
        const lessonId = req.params.lessonId;
        const fileArray = req.files;
        for (let i = 0; i < fileArray.length; i++) {
            await LessonFile.create({
                file_FieldName: fileArray[i].fieldname,
                file_Path: fileArray[i].path,
                file_MimeType: fileArray[i].mimetype,
                file_OriginalName: fileArray[i].originalname,
                file_FileName: fileArray[i].filename,
                courseId: courseId,
                sectionId: sectionId,
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

exports.deleteResource = async (req, res) => {
    try {

        const id = req.params.id;
        const lessonFile = await LessonFile.findOne({
            where: {
                id: id,
                adminId: req.admin.id
            }
        });
        if (!lessonFile) {
            return res.status(400).send({
                success: false,
                message: "Resource not found!"
            })
        }
        if (lessonFile.file_Path) {
            deleteSingleFile(lessonFile.file_Path);
        }
        await lessonFile.destroy();
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