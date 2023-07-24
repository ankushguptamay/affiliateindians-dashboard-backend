const db = require('../../../Models');
const Lecture = db.lecture;
const LecturesFile = db.lectureFile;
const LecturesVideo = db.lectureVideo;
const LecturesQuiz = db.lectureQuiz;
const { deleteFile } = require("../../../Util/deleteFile");
const axios = require('axios');

// createLecture lesson name is required
// getLectureByLectureId
// updateLecture
// publicLecture

exports.createLecture = async (req, res) => {
    try {
        const { lessonName, codeExample, customCode, richTextEditor, sectionId, courseId } = req.body;
        if (lessonName && sectionId && courseId) {
            await Lecture.create({
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

exports.getLectureByLectureId = async (req, res) => {
    try {
        const lectureId = req.params.id;
        const lecture = await Lecture.findOne({
            where: {
                id: lectureId
            },
            include: [{
                model: LecturesFile,
                as: "lessonFiles",
                order: [
                    ['fileName', 'ASC'],
                    ['createdAt', 'ASC']
                ]
            }, {
                model: LecturesQuiz,
                as: "lessonQuizs",
                order: [
                    ['createdAt', 'DESC']
                ]
            }, {
                model: LecturesVideo,
                as: "lessonVideos",
                order: [
                    ['createdAt', 'ASC']
                ]
            }]
        });
        if (!lecture) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        }
        res.status(200).send({
            success: true,
            message: `Lesson fetched successfully!`,
            data: lecture
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
exports.updateLecture = async (req, res) => {
    try {
        const lectureId = req.params.id;
        const { codeExample, customCode, richTextEditor } = req.body;
        const lecture = await Lecture.findOne({ where: { id: lectureId } });
        if (!lecture) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        }
        await lecture.update({
            ...lecture,
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

exports.publicLecture = async (req, res) => {
    try {
        const id = req.params.id;
        const lecture = await Lecture.findOne({ where: { id: id } });
        if (!lecture) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        };
        await lecture.update({
            ...lecture,
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

exports.addOrUpdateThumbNail = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a thumbnail!"
            });
        }
        const id = req.params.id;
        const lecture = await Lecture.findOne({
            where: { id: id },
            include: [{
                model: AddCourse,
                as: 'addCourse'
            }]

        });
        if (!lecture) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        };
        // add to buuny video
        const setThumbNail = {
            method: "POST",
            url: `http://video.bunnycdn.com/library/${lecture.addCourse.BUNNY_LIBRARY_API_KEY}/videos/${lecture.Video_ID}/thumbnail`,
            params: {
                thumbnailUrl: req.body.url
            },
            headers: {
                Accept: "application/json",
                AccessKey: lecture.addCourse.BUNNY_LIBRARY_API_KEY,
            }
        };
        await axios
            .request(setThumbNail)
            .then((response) => {
                // console.log("resposse: ", response.data);
            })
            .catch((error) => {
                // console.log(error);
                deleteFile(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: "failed to upload thumbnail! upload again",
                    bunnyMessage: error.message
                });
            });
        // delete existing file
        let message = "added";
        if (lecture.Thumbnail_URL) {
            deleteFile(lecture.Thumbnail_URL);
            message = "updated";
        }
        await lecture.update({
            ...lecture,
            Thumbnail_URL: req.file.path
        });
        res.status(201).send({
            success: true,
            message: `Lesson's thumbnail ${message} successfully!`
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

exports.addOrUpdateLectureFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a PDF!"
            });
        }
        const id = req.params.id;
        const lecture = await Lecture.findOne({ where: { id: id } });
        if (!lecture) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        };
        // delete existing file
        let message = "added";
        if (lecture.PDFile) {
            deleteFile(lecture.PDFile);
            message = "updated";
        }
        await lecture.update({
            ...lecture,
            PDFile: req.file.path
        });
        res.status(201).send({
            success: true,
            message: `Lesson's file ${message} successfully!`
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

exports.deleteLecture = async (req, res) => {
    try {
        const id = req.params.id;
        const lecture = await Lecture.findOne({ where: { id: id } });
        if (!lecture) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        };
        const addCourse = await AddCourse.findOne({ where: { id: lecture.addCourse_id } });
        // delete lecture file
        if (lecture.PDFile) {
            deleteFile(lecture.PDFile);
        }
        // delete lecture thumbnail
        if (lecture.Thumbnail_URL) {
            deleteFile(lecture.Thumbnail_URL);
        }
        // delete file from bunny
        const deleteVideo = {
            method: "DELETE",
            url: `http://video.bunnycdn.com/library/${addCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/${lecture.Video_ID}`,
            headers: {
                AccessKey: addCourse.BUNNY_LIBRARY_API_KEY,
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
        // delete lecture from database
        await lecture.destroy();
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

exports.deleteLectureFile = async (req, res) => {
    try {
        const id = req.params.id;
        const lecture = await Lecture.findOne({ where: { id: id } });
        if (!lecture) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        };
        // delete file
        if (lecture.PDFile) {
            deleteFile(lecture.PDFile);
        }
        await lecture.update({
            ...lecture,
            PDFile: null
        });
        res.status(201).send({
            success: true,
            message: `Lesson's file deleted successfully!`
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