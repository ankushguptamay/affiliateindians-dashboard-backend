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
            fileName: req.file.fieldname,
            filePath: req.file.path,
            mimeType: req.file.mimetype,
            courseId: courseId,
            sectionId: sectionId,
            lessonId: lessonId,
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
                id: id
            }
        });
        if (!lessonFile) {
            return res.status(400).send({
                success: false,
                message: "Banner not found!"
            })
        }
        if (lessonFile.filePath) {
            deleteSingleFile(lessonFile.filePath);
        }
        await lessonFile.update({
            ...lessonFile,
            fileName: req.file.fieldname,
            filePath: req.file.path,
            mimeType: req.file.mimetype
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
                message: "Select a atleast one PDF!"
            });
        }
        const { courseId, sectionId } = req.body;
        const lessonId = req.params.lessonId;
        const fileArray = (req.files).map((file) => { return file.path });
        for (let i = 0; i < fileArray.length; i++) {
            await LessonFile.create({
                fileName: "lessonPDF",
                filePath: fileArray[i],
                mimeType: "application/pdf",
                courseId: courseId,
                sectionId: sectionId,
                lessonId: lessonId,
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
                id: id
            }
        });
        if (!lessonFile) {
            return res.status(400).send({
                success: false,
                message: "PDF not found!"
            })
        }
        if (lessonFile.filePath) {
            deleteSingleFile(lessonFile.filePath);
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
                message: "Select a atleast one File!"
            });
        }
        const { courseId, sectionId } = req.body;
        const lessonId = req.params.lessonId;
        const fileArray = req.files;
        for (let i = 0; i < fileArray.length; i++) {
            await LessonFile.create({
                fileName: fileArray[i].fieldname,
                filePath: fileArray[i].path,
                mimeType: fileArray[i].mimetype,
                courseId: courseId,
                sectionId: sectionId,
                lessonId: lessonId,
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
                id: id
            }
        });
        if (!lessonFile) {
            return res.status(400).send({
                success: false,
                message: "Resource not found!"
            })
        }
        if (lessonFile.filePath) {
            deleteSingleFile(lessonFile.filePath);
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