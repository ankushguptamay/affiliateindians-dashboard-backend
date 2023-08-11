const db = require('../../../Models');
const Lesson = db.lesson;
const LessonFile = db.lessonFile;
const LessonVideo = db.lessonVideo;
const LessonQuiz = db.lessonQuiz;
const VideoComment = db.videoComment;
const { deleteSingleFile, deleteMultiFile } = require("../../../Util/deleteFile");
const axios = require('axios');

// createLesson lesson name is required
// getLessonByLessonId
// updateLesson
// publicLesson
// deleteLesson

exports.createLesson = async (req, res) => {
    try {
        const { lessonName, codeExample, customCode, richTextEditor, sectionId, courseId } = req.body;
        if (lessonName && sectionId && courseId) {
            await Lesson.create({
                lessonName: lessonName,
                codeExample: codeExample,
                customCode: customCode,
                richTextEditor: richTextEditor,
                sectionId: sectionId,
                courseId: courseId,
                adminId: req.admin.id
            });
            res.status(201).send({
                success: true,
                message: `Lesson added successfully!`
            });
        } else {
            res.status(400).send({
                success: false,
                message: `LessonName, sectionId, curseId should present!`
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

exports.getLessonByLessonId = async (req, res) => {
    try {
        const lessonId = req.params.id;
        const lesson = await Lesson.findOne({
            where: {
                id: lessonId
            },
            include: [{
                model: LessonFile,
                as: "lessonFiles",
                order: [
                    ['fileName', 'ASC'],
                    ['createdAt', 'ASC']
                ]
            }, {
                model: LessonQuiz,
                as: "lessonQuizs",
                order: [
                    ['createdAt', 'DESC']
                ]
            }, {
                model: LessonVideo,
                as: "lessonVideos",
                order: [
                    ['createdAt', 'ASC']
                ]
            }]
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

// update customCode, richTextEditor, codeExample
exports.updateLesson = async (req, res) => {
    try {
        const lessonId = req.params.id;
        const { codeExample, customCode, richTextEditor } = req.body;
        const lesson = await Lesson.findOne({ where: { id: lessonId } });
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
            richTextEditor: richTextEditor
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
        const lesson = await Lesson.findOne({ where: { id: id } });
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
            message: `Lesson publiced successfully!`
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

exports.deleteLesson = async (req, res) => {
    try {
        const id = req.params.id;
        const lesson = await Lesson.findOne({ where: { id: id } });
        if (!lesson) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        };
        // delete associated video
        const video = await LessonVideo.findAll({ lessonId: id });
        const commentFileArray = [];
        const thumbnailArray = [];
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
                thumbnailArray.push(video[i].Thumbnail_Path);
                const comment = await VideoComment.findAll({ where: { lessonVideoId: video[i].id } });
                for (let i = 0; i < comment.length; i++) {
                    commentFileArray.push(comment[i].file_Path);
                }
            }
        }
        // delete thumbnail
        if (thumbnailArray.length > 0) {
            deleteMultiFile(thumbnailArray);
        }
        // delete comment Files
        if (commentFileArray.length > 0) {
            deleteMultiFile(commentFileArray);
        }
        // delete lesson files
        const lessonFileArray = [];
        const lessonFile = await LessonFile.findAll({ where: { lessonId: id } });
        for (let i = 0; i < lessonFile.length; i++) {
            lessonFileArray.push(lessonFile[i].file_Path);
        }
        if (lessonFileArray.length > 0) {
            deleteMultiFile(lessonFileArray);
        }
        // delete lesson from database
        await lesson.destroy();
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
