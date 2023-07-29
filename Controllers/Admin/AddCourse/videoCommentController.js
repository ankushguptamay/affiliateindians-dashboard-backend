const db = require('../../../Models');
const VideoComment = db.videoComment;
const { deleteSingleFile } = require("../../../Util/deleteFile");

// addCommentForAdmin
// deleteCommentForAdmin
// getCommentForAdmin
// approveComment
// addCommentForUser
// deleteCommentForUser
// getCommentForUser

exports.addCommentForAdmin = async (req, res) => {
    try {
        const { commenterName, courseId, sectionId, lessonId, message } = req.body;
        const lessonVideoId = req.params.lessonVideoId;
        if (req.files.length > 0) {
            const files = req.files;
            for (let i = 0; i < files; i++) {
                await VideoComment.create({
                    commenterName: commenterName,
                    approvalStatus: true,
                    mimeType: files[i].mimetype,
                    filePath: files[i].path,
                    commenterId: req.admin.id,
                    courseId: courseId,
                    sectionId: sectionId,
                    lessonId: lessonId,
                    lessonVideoId: lessonVideoId
                });
            }
        } else {
            await VideoComment.create({
                commenterName: commenterName,
                approvalStatus: true,
                message: message,
                commenterId: req.admin.id,
                courseId: courseId,
                sectionId: sectionId,
                lessonId: lessonId,
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

exports.deleteCommentForAdmin = async (req, res) => {
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
        if (comment.filePath) {
            deleteSingleFile(comment.filePath);
        }
        await comment.destroy();
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
        const { commenterName, courseId, sectionId, lessonId, message } = req.body;
        const lessonVideoId = req.params.lessonVideoId;
        if (req.files.length > 0) {
            const files = req.files;
            for (let i = 0; i < files; i++) {
                await VideoComment.create({
                    commenterName: commenterName,
                    mimeType: files[i].mimetype,
                    filePath: files[i].path,
                    commenterId: req.user.id,
                    courseId: courseId,
                    sectionId: sectionId,
                    lessonId: lessonId,
                    lessonVideoId: lessonVideoId
                });
            }
        } else {
            await VideoComment.create({
                commenterName: commenterName,
                message: message,
                commenterId: req.user.id,
                courseId: courseId,
                sectionId: sectionId,
                lessonId: lessonId,
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

exports.deleteCommentForUser = async (req, res) => {
    try {
        const id = req.params.id;
        const comment = await VideoComment.findOne({
            where: {
                id: id, commenterId: req.user.id
            }
        });
        if (!comment) {
            return res.status(400).send({
                success: false,
                message: "Comment not found!"
            })
        }
        if (comment.filePath) {
            deleteSingleFile(comment.filePath);
        }
        await comment.destroy();
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
                approvalStatus: true, lessonVideoId: lessonVideoId
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
        const comment = await VideoComment.findAll({ where: { lessonVideoId: lessonVideoId } });
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
                approvalStatus: false, id: id
            }
        });
        if (!comment) {
            return res.status(400).send({
                success: false,
                message: "Comment dose not exist!"
            })
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
