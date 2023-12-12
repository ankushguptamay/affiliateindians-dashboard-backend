const { Op } = require('sequelize');
const db = require('../../../Models');
const VideoComment = db.videoComment;
const LessonVideo = db.lessonVideo;
const Course = db.course;
const { deleteSingleFile } = require("../../../Util/deleteFile");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// addCommentForAdmin
// deleteCommentForAdmin
// getCommentForAdmin
// approveComment
// addCommentForUser
// deleteCommentForUser
// getCommentForUser

exports.addCommentForAdmin = async (req, res) => {
    try {
        const { commenterName, message } = req.body;
        const lessonVideoId = req.params.lessonVideoId;
        const video = await LessonVideo.findOne({ where: { id: lessonVideoId } });
        if (req.files.length > 0) {
            const files = req.files;
            for (let i = 0; i < files.length; i++) {
                // Upload image to cloudinary
                const imagePath = `./Resources/Lesson/${files[i].filename}`
                const image = await cloudinary.uploader.upload(imagePath);
                // delete file from resource
                deleteSingleFile(files[i].path);
                await VideoComment.create({
                    commenterName: commenterName,
                    approvalStatus: true,
                    mimeType: files[i].mimetype,
                    cloudinaryFileId: image.public_id,
                    file_Path: image.secure_url,
                    file_OriginalName: files[i].originalname,
                    file_FileName: files[i].filename,
                    commenterId: req.admin.id,
                    courseId: video.courseId,
                    sectionId: video.sectionId,
                    lessonId: video.lessonId,
                    lessonVideoId: lessonVideoId
                });
            }
        } else {
            await VideoComment.create({
                commenterName: commenterName,
                approvalStatus: true,
                message: message,
                commenterId: req.admin.id,
                courseId: video.courseId,
                sectionId: video.sectionId,
                lessonId: video.lessonId,
                lessonVideoId: lessonVideoId
            });
        }
        res.status(201).send({
            success: true,
            message: `Comment added successfully!`
        });
    }
    catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.hardDeleteCommentForAdmin = async (req, res) => {
    try {
        const id = req.params.id;
        const comment = await VideoComment.findOne({
            where: {
                id: id
            }
        });
        if (!comment) {
            return res.status(400).send({
                success: false,
                message: "Comment not found!"
            })
        }
        if (req.admin.adminTag === "ADMIN") {
            const findCourse = await Course.findOne({
                id: comment.courseId,
                adminId: req.admin.id
            });
            if (!findCourse) {
                return res.status(400).send({
                    success: true,
                    message: `You can not delete this comment!`
                });
            }
        }
        if (comment.cloudinaryFileId) {
            await cloudinary.uploader.destroy(comment.cloudinaryFileId);
        }
        await comment.destroy({ force: true });
        res.status(201).send({
            success: true,
            message: `Comment deleted successfully!`
        });
    }
    catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.addCommentForUser = async (req, res) => {
    try {
        const { commenterName, message } = req.body;
        const lessonVideoId = req.params.lessonVideoId;
        const video = await LessonVideo.findOne({ where: { id: lessonVideoId } });
        if (req.files.length > 0) {
            const files = req.files;
            for (let i = 0; i < files.length; i++) {
                // Upload image to cloudinary
                const imagePath = `./Resources/Lesson/${files[i].filename}`
                const image = await cloudinary.uploader.upload(imagePath);
                // delete file from resource
                deleteSingleFile(files[i].path);
                await VideoComment.create({
                    commenterName: commenterName,
                    mimeType: files[i].mimetype,
                    cloudinaryFileId: image.public_id,
                    file_Path: image.secure_url,
                    file_OriginalName: files[i].originalname,
                    file_FileName: files[i].filename,
                    commenterId: req.user.id,
                    courseId: video.courseId,
                    sectionId: video.sectionId,
                    lessonId: video.lessonId,
                    lessonVideoId: lessonVideoId
                });
            }
        } else {
            await VideoComment.create({
                commenterName: commenterName,
                message: message,
                commenterId: req.user.id,
                courseId: video.courseId,
                sectionId: video.sectionId,
                lessonId: video.lessonId,
                lessonVideoId: lessonVideoId
            });
        }
        res.status(201).send({
            success: true,
            message: `Comment added successfully!`
        });
    }
    catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.hardDeleteCommentForUser = async (req, res) => {
    try {
        const id = req.params.id;
        const comment = await VideoComment.findOne({
            where: {
                id: id,
                commenterId: req.user.id
            }
        });
        if (!comment) {
            return res.status(400).send({
                success: false,
                message: "Comment is not found!"
            })
        }
        if (comment.cloudinaryFileId) {
            await cloudinary.uploader.destroy(comment.cloudinaryFileId);
        }
        await comment.destroy({ force: true });
        res.status(201).send({
            success: true,
            message: `Comment deleted successfully!`
        });
    }
    catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getCommentForUser = async (req, res) => {
    try {
        const lessonVideoId = req.params.lessonVideoId;
        const comment = await VideoComment.findAll({
            where: {
                approvalStatus: true,
                lessonVideoId: lessonVideoId
            }
        });
        res.status(201).send({
            success: true,
            message: `Comment Fetched successfully!`,
            data: comment
        });
    }
    catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getCommentForAdmin = async (req, res) => {
    try {
        const lessonVideoId = req.params.lessonVideoId;
        const comment = await VideoComment.findAll({
            where: {
                lessonVideoId: lessonVideoId
            }
        });
        res.status(201).send({
            success: true,
            message: `Comment Fetched successfully!`,
            data: comment
        });
    }
    catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.approveComment = async (req, res) => {
    try {
        const id = req.params.id;
        const comment = await VideoComment.findOne({
            where: {
                approvalStatus: false,
                id: id
            }
        });
        if (!comment) {
            return res.status(400).send({
                success: false,
                message: "Comment dose not exist!"
            })
        }
        if (req.admin.adminTag === "ADMIN") {
            const findCourse = await Course.findOne({
                id: comment.courseId,
                adminId: req.admin.id
            });
            if (!findCourse) {
                return res.status(400).send({
                    success: true,
                    message: `You can not approve this comment!`
                });
            }
        }
        await comment.update({
            ...comment,
            approvalStatus: true
        })
        res.status(201).send({
            success: true,
            message: `Comment Approved successfully!`
        });
    }
    catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};
