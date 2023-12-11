const { Op } = require('sequelize');
const db = require('../../../Models');
const LessonFile = db.lessonFile;
const Lesson = db.lesson;
const cloudinary = require("cloudinary").v2;
const { deleteSingleFile } = require("../../../Util/deleteFile");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


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
        // Upload image to cloudinary
        const imagePath = `./Resources/Lesson/${req.file.filename}`
        const image = await cloudinary.uploader.upload(imagePath);
        // delete file from server
        deleteSingleFile(req.file.path);
        await LessonFile.create({
            file_FieldName: req.file.fieldname,
            file_Path: image.secure_url,
            file_MimeType: req.file.mimetype,
            file_OriginalName: req.file.originalname,
            file_FileName: req.file.filename,
            cloudinaryFileId: image.public_id,
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
        // Upload image to cloudinary
        const imagePath = `./Resources/Lesson/${req.file.filename}`
        const image = await cloudinary.uploader.upload(imagePath);
        // delete file from server
        deleteSingleFile(req.file.path);
        if (lessonFile.cloudinaryFileId) {
            await cloudinary.uploader.destroy(lessonFile.cloudinaryFileId);
        }
        await lessonFile.update({
            ...lessonFile,
            file_FieldName: req.file.fieldname,
            file_Path: req.file.path,
            file_Path: image.secure_url,
            cloudinaryFileId: image.public_id,
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
            // Upload image to cloudinary
            const filePath = `./Resources/Lesson/${fileArray[i].filename}`;
            const file = await cloudinary.uploader.upload(filePath);
            // Delete file from server
            deleteSingleFile(fileArray[i].path);
            await LessonFile.create({
                file_FieldName: fileArray[i].fieldname,
                file_Path: file.secure_url,
                file_MimeType: fileArray[i].mimetype,
                file_OriginalName: fileArray[i].originalname,
                file_FileName: fileArray[i].filename,
                cloudinaryFileId: file.public_id,
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
        if (lessonFile.cloudinaryFileId) {
            await cloudinary.uploader.destroy(lessonFile.cloudinaryFileId);
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
            // Upload image to cloudinary
            const filePath = `./Resources/Lesson/${fileArray[i].filename}`;
            let file;
            if (fileArray[i].mimetype.startsWith("image") || fileArray[i].mimetype.startsWith("application/pdf")) {
                file = await cloudinary.uploader.upload(filePath);
            } else {
                file = await cloudinary.uploader.upload(filePath, { resource_type: "raw" });
            }
            // Delete file from server
            deleteSingleFile(fileArray[i].path);
            await LessonFile.create({
                file_FieldName: fileArray[i].fieldname,
                file_Path: file.secure_url,
                file_MimeType: fileArray[i].mimetype,
                file_OriginalName: fileArray[i].originalname,
                file_FileName: fileArray[i].filename,
                cloudinaryFileId: file.public_id,
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
        if (lessonFile.cloudinaryFileId) {
            await cloudinary.uploader.destroy(lessonFile.cloudinaryFileId);
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