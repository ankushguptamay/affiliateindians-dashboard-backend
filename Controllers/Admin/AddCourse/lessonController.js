const db = require('../../../Models');
const Lesson= db.lesson;
const LessonFile = db.lessonFile;
const LessonVideo = db.lessonVideo;
const LessonQuiz = db.lessonQuiz;
const { deleteSingleFile } = require("../../../Util/deleteFile");
const axios = require('axios');

// createLesson lesson name is required
// getLessonByLessonId
// updateLesson
// publicLesson

exports.createLesson = async (req, res) => {
    try {
        const { lessonName, codeExample, customCode, richTextEditor, sectionId, courseId } = req.body;
        if (lessonName && sectionId && courseId) {
            await Lesson.create({
                lessonName: lessonName,
                codeExample: codeExample,
                customCode: customCode,
                richTextEditor: richTextEditor,
                section_id: sectionId,
                addCourse_id: courseId,
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

// exports.deleteLesson = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const lesson = await Lesson.findOne({ where: { id: id } });
//         if (!lesson) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Lesson is not present!"
//             });
//         };
//         const addCourse = await AddCourse.findOne({ where: { id: lesson.addCourse_id } });
//         // delete lesson file
//         if (lesson.PDFile) {
//             deleteSingleFile(lesson.PDFile);
//         }
//         // delete lesson thumbnail
//         if (lesson.Thumbnail_URL) {
//             deleteSingleFile(lesson.Thumbnail_URL);
//         }
//         // delete file from bunny
//         const deleteVideo = {
//             method: "DELETE",
//             url: `http://video.bunnycdn.com/library/${addCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/${lesson.Video_ID}`,
//             headers: {
//                 AccessKey: addCourse.BUNNY_LIBRARY_API_KEY,
//             }
//         };

//         await axios
//             .request(deleteVideo)
//             .then((response) => {
//                 // console.log("delete: ", response.data);
//             })
//             .catch((error) => {
//                 // console.log(error);
//                 return res.status(400).send({
//                     success: false,
//                     message: "Delete request of video failed from bunny. try to delete again!",
//                     bunnyMessage: error.message
//                 });
//             });
//         // delete lesson from database
//         await lesson.destroy();
//         res.status(200).send({
//             success: true,
//             message: `Lesson deleted successfully!`
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send({
//             success: false,
//             err: err.message
//         });
//     }
// };
