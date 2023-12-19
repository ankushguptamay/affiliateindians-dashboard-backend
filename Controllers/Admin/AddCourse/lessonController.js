const db = require('../../../Models');
const Lesson = db.lesson;
const Assignment = db.assignment;
const UpSell = db.upSell;
const LessonFile = db.lessonFile;
const LessonVideo = db.lessonVideo;
const LessonQuiz = db.lessonQuiz;
const Course = db.course;
const VideoComment = db.videoComment;
const User_Course = db.user_course;
const Section = db.section;
const LessonText = db.lessonText;
const { deleteSingleFile, deleteMultiFile } = require("../../../Util/deleteFile");
const axios = require('axios');
const { Op } = require('sequelize');
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// createLesson lesson name is required
// getLessonByLessonId
// updateLesson
// publicLesson
// deleteLesson

exports.createLesson = async (req, res) => {
    try {
        const { lessonName, codeExample, customCode, richTextEditor, sectionId } = req.body;
        const section = await Section.findOne({
            where: {
                id: sectionId
            }
        });
        if (lessonName && sectionId) {
            await Lesson.create({
                lessonName: lessonName,
                codeExample: codeExample,
                customCode: customCode,
                richTextEditor: richTextEditor,
                sectionId: sectionId,
                courseId: section.courseId,
                adminId: req.admin.id
            });
            res.status(201).send({
                success: true,
                message: `Lesson added successfully!`
            });
        } else {
            res.status(400).send({
                success: false,
                message: `LessonName and sectionId should be present!`
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getLessonByLessonIdForAdmin = async (req, res) => {
    try {
        const lessonId = req.params.id;
        // Updating encoding video
        const findEncodeingVideo = await LessonVideo.findAll({
            where: {
                lessonId: lessonId,
                encodeProgress: { [Op.lt]: 100 },
                videoType: "VIDEO"
            }
        });
        for (let i = 0; i < findEncodeingVideo.length; i++) {
            // get to buuny video
            const object = {
                method: "GET",
                url: `http://video.bunnycdn.com/library/${findEncodeingVideo[i].BUNNY_VIDEO_LIBRARY_ID}/videos/${findEncodeingVideo[i].Video_ID}`,
                headers: {
                    Accept: "application/json",
                    AccessKey: findEncodeingVideo[i].BUNNY_LIBRARY_API_KEY,
                }
            };
            let bunnyResopnse;
            await axios
                .request(object)
                .then((response) => {
                    // console.log("resposse: ", response.data);
                    bunnyResopnse = response;
                })
                .catch((error) => {
                    return res.status(400).json({
                        success: false,
                        message: "Error",
                        bunnyMessage: error
                    });
                });
            await LessonVideo.update({
                encodeProgress: bunnyResopnse.data.encodeProgress
            }, {
                where: { id: findEncodeingVideo[i].id }
            });
        }
        const lesson = await Lesson.findOne({
            where: {
                id: lessonId
            },
            include: [{
                model: LessonFile,
                as: "lessonFiles",
            }, {
                model: LessonQuiz,
                as: "lessonQuizs",
            }, {
                model: LessonVideo,
                as: "lessonVideos",
            }, {
                model: UpSell,
                as: "upSell",
            }, {
                model: Assignment,
                as: "assignment",
            }, {
                model: LessonText,
                as: "lessonTexts"
            }],
            order: [
                ['createdAt', 'ASC'],
                [{ model: LessonFile, as: "lessonFiles" }, 'createdAt', 'ASC'],
                [{ model: LessonQuiz, as: "lessonQuizs" }, 'createdAt', 'ASC'],
                [{ model: LessonVideo, as: "lessonVideos" }, 'createdAt', 'ASC'],
                [{ model: Assignment, as: "assignment" }, 'createdAt', 'ASC'],
                [{ model: LessonText, as: "lessonTexts" }, 'createdAt', 'ASC']
            ]
        });
        if (!lesson) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        }
        res.status(200).send({
            success: true,
            message: `Lesson fetched successfully!`,
            data: lesson
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getLessonByLessonIdForUser = async (req, res) => {
    try {
        const lessonId = req.params.id;
        // Updating encoding video
        const findEncodeingVideo = await LessonVideo.findAll({
            where: {
                lessonId: lessonId,
                encodeProgress: { [Op.lt]: 100 },
                videoType: "VIDEO"
            }
        });
        for (let i = 0; i < findEncodeingVideo.length; i++) {
            // get to buuny video
            const object = {
                method: "GET",
                url: `http://video.bunnycdn.com/library/${findEncodeingVideo[i].BUNNY_VIDEO_LIBRARY_ID}/videos/${findEncodeingVideo[i].Video_ID}`,
                headers: {
                    Accept: "application/json",
                    AccessKey: findEncodeingVideo[i].BUNNY_LIBRARY_API_KEY,
                }
            };
            let bunnyResopnse;
            await axios
                .request(object)
                .then((response) => {
                    // console.log("resposse: ", response.data);
                    bunnyResopnse = response;
                })
                .catch((error) => {
                    return res.status(400).json({
                        success: false,
                        message: "Error",
                        bunnyMessage: error
                    });
                });
            await LessonVideo.update({
                encodeProgress: bunnyResopnse.data.encodeProgress
            }, {
                where: { id: findEncodeingVideo[i].id }
            });
        }
        const lesson = await Lesson.findOne({
            where: {
                id: lessonId,
                isPublic: true
            },
            include: [{
                model: LessonFile,
                as: "lessonFiles"
            }, {
                model: LessonQuiz,
                as: "lessonQuizs"
            }, {
                model: LessonVideo,
                as: "lessonVideos"
            }, {
                model: UpSell,
                as: "upSell",
            }, {
                model: Assignment,
                as: "assignment",
            }, {
                model: LessonText,
                as: "lessonTexts"
            }],
            order: [
                ['createdAt', 'ASC'],
                [{ model: LessonFile, as: "lessonFiles" }, 'createdAt', 'ASC'],
                [{ model: LessonQuiz, as: "lessonQuizs" }, 'createdAt', 'ASC'],
                [{ model: LessonVideo, as: "lessonVideos" }, 'createdAt', 'ASC'],
                [{ model: Assignment, as: "assignment" }, 'createdAt', 'ASC'],
                [{ model: LessonText, as: "lessonTexts" }, 'createdAt', 'ASC']
            ]
        });
        if (!lesson) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        }
        const course = await Course.findOne({
            where: {
                id: lesson.courseId,
                isPublic: true
            },
            attributes: ["id", "title", "isPublic"]
        });
        if (course.isPaid === true) {
            const isPurchase = await User_Course.findOne({
                where: {
                    courseId: lesson.courseId,
                    userId: req.user.id,
                    verify: true,
                    status: "paid"
                }
            });
            if (!isPurchase) {
                return res.status(400).send({
                    success: false,
                    message: "Purchase this course!"
                });
            }
        }
        res.status(200).send({
            success: true,
            message: `Lesson fetched successfully!`,
            data: lesson
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

// update customCode, richTextEditor, codeExample
exports.updateLesson = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const { codeExample, customCode, richTextEditor, lessonName } = req.body;
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
        }
        await lesson.update({
            ...lesson,
            codeExample: codeExample,
            customCode: customCode,
            richTextEditor: richTextEditor,
            lessonName: lessonName
        });
        res.status(200).send({
            success: true,
            message: `Lesson modified successfully!`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.publicLesson = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
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
        await lesson.update({
            ...lesson,
            isPublic: true
        });
        res.status(200).send({
            success: true,
            message: `Lesson published successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.unPublicLesson = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
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
        await lesson.update({
            ...lesson,
            isPublic: false
        });
        res.status(200).send({
            success: true,
            message: `Lesson unpublished successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};


exports.hardDeleteLesson = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
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
        // delete associated video
        const video = await LessonVideo.findAll({
            where: {
                lessonId: id,
                videoType: "VIDEO"
            }
        });
        const commentFileArray = [];
        if (video.length > 0) {
            // delete video from bunny
            for (let i = 0; i < video.length; i++) {
                const deleteVideo = {
                    method: "DELETE",
                    url: `http://video.bunnycdn.com/library/${video[i].BUNNY_VIDEO_LIBRARY_ID}/videos/${video[i].Video_ID}`,
                    headers: {
                        AccessKey: video[i].BUNNY_LIBRARY_API_KEY,
                    }
                };

                await axios
                    .request(deleteVideo)
                    .then((response) => {
                        // console.log("delete: ", response.data);
                    })
                    .catch((error) => {
                        // console.log(error);
                        return res.status(400).send({
                            success: false,
                            message: "Delete request of video failed from bunny. try to delete again!",
                            bunnyMessage: error.message
                        });
                    });
                // delete thumbnail from cloudinary
                if (video[i].cloudinaryImageId) {
                    await cloudinary.uploader.destroy(video[i].cloudinaryImageId);
                }
            }
        }
        // Get All comment file
        const comment = await VideoComment.findAll({ where: { lessonId: id } });
        for (let i = 0; i < comment.length; i++) {
            commentFileArray.push(comment[i].file_Path);
        }
        // delete comment Files
        if (commentFileArray.length > 0) {
            deleteMultiFile(commentFileArray);
        }
        // delete lesson files
        const lessonFile = await LessonFile.findAll({ where: { lessonId: id } });
        for (let i = 0; i < lessonFile.length; i++) {
            if (lessonFile[i].cloudinaryFileId) {
                await cloudinary.uploader.destroy(lessonFile[i].cloudinaryFileId);
            }
        }
        // delete video from database
        await LessonVideo.destroy({
            where: {
                lessonId: id
            }, force: true
        });
        // delete VideoComment from database
        await VideoComment.destroy({
            where: {
                lessonId: id
            }, force: true
        });
        // delete lessonText from database
        await LessonText.destroy({
            where: {
                lessonId: id
            }, force: true
        });
        // delete LessonFile from database
        await LessonFile.destroy({
            where: {
                lessonId: id
            }, force: true
        });
        // delete quiz from database
        await LessonQuiz.destroy({
            where: {
                lessonId: id
            }, force: true
        });
        // delete lesson from database
        await lesson.destroy({ force: true });
        res.status(200).send({
            success: true,
            message: `Lesson deleted successfully!`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};
