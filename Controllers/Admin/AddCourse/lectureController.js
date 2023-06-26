const { AddCourse, Lecture } = require('../../../Models');
const { deleteFile } = require("../../../Util/deleteFile");
const axios = require('axios');

exports.createLecture = async (req, res) => {
    try {
        const { lessonName, text, quiz, codeExample, customCode, richTextEditor, section_id, addCourse_id } = req.body;
        if (lessonName && section_id && addCourse_id) {
            await Lecture.create({
                lessonName: lessonName,
                text: text,
                quiz: quiz,
                codeExample: codeExample,
                customCode: customCode,
                richTextEditor: richTextEditor,
                section_id: section_id,
                addCourse_id: addCourse_id
            });
            res.status(201).send({
                success: true,
                message: `Lesson added successfully!`
            });
        } else {
            res.status(400).send({
                success: false,
                message: `LessonName, section_id, addCourse_id should present!`
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

exports.uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a video!"
            });
        }
        // find lecture
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
        // upload video to bunny
        let video_id;
        const optionsToCreateVideo = {
            method: "POST",
            url: `http://video.bunnycdn.com/library/${lecture.addCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/`,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                AccessKey: lecture.addCourse.BUNNY_LIBRARY_API_KEY,
            },
            data: JSON.stringify({ title: lecture.lessonName }),
        };

        await axios
            .request(optionsToCreateVideo)
            .then((response) => {
                video_id = response.data.guid;
                const video = req.file.buffer;
                axios.put(`http://video.bunnycdn.com/library/${lecture.addCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/${video_id}`,
                    video, {
                    headers: {
                        Accept: "application/json",
                        'Content-Type': 'application/json',
                        AccessKey: lecture.addCourse.BUNNY_LIBRARY_API_KEY,
                    }
                }
                ).then(result => {
                    // console.log("result: ", result.data);
                }, (error) => {
                    // console.log("error: ", error);
                })
            })
            .catch((error) => {
                console.log(error);
                return res.status(400).json({
                    success: false,
                    message: "failed to add lecture!",
                    bunnyMessage: error.message
                });
            });
        // if video is already present then delete existing video
        let message = "added";
        if (lecture.Video_id) {
            const deleteVideo = {
                method: "DELETE",
                url: `http://video.bunnycdn.com/library/${lecture.addCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/${lecture.Video_id}`,
                headers: {
                    AccessKey: lecture.addCourse.BUNNY_LIBRARY_API_KEY,
                }
            };
            axios.request(deleteVideo);
            message = "updated";
        }
        // add new video in databse
        await lecture.update({
            ...lecture,
            Video_ID: video_id,
            Iframe_URL: `https://iframe.mediadelivery.net/embed/${addCourse.BUNNY_VIDEO_LIBRARY_ID}/${video_id}`,
            Direct_Play_URL: `https://iframe.mediadelivery.net/play/${addCourse.BUNNY_VIDEO_LIBRARY_ID}/${video_id}`
        });
        res.status(201).send({
            success: true,
            message: `Lesson's video ${message} successfully!`
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

exports.getLectureForAdmin = async (req, res) => {
    try {
        const lecture = await Lecture.findAll({
            where: {
                section_id: req.params.section_id
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "Lesson fetched successfully!",
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

// update text, quiz, customCode, richTextEditor, codeExample
exports.updateLecture = async (req, res) => {
    try {
        const id = req.params.id;
        const { text, quiz, codeExample, customCode, richTextEditor } = req.body;
        const lecture = await Lecture.findOne({ where: { id: id } });
        if (!lecture) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        }
        await lecture.update({
            ...lecture,
            text: text,
            quiz: quiz,
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