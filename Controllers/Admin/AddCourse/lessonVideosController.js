const db = require('../../../Models');
const Lesson = db.lesson;
const Course = db.course;
const LessonVideo = db.lessonVideo;
const VideoComment = db.videoComment;
const { deleteSingleFile, deleteMultiFile } = require("../../../Util/deleteFile");
const axios = require('axios');

// uploadLessonVideo
// deleteLessonVideo
// addOrUpdateThumbNail
// getAllVideoByLessonId

exports.uploadLessonVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a video!"
            });
        }
        // find lesson
        const { courseId, sectionId } = req.body;
        const lessonId = req.params.lessonId;
        const lesson = await Lesson.findOne({
            where: { id: lessonId },
            include: [{
                model: Course,
                as: 'parentCourse'
            }]

        });
        if (!lesson) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        };
        // upload video to bunny
        let video_id;
        const optionsToCreateVideo = {
            method: "POST",
            url: `http://video.bunnycdn.com/library/${lesson.parentCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/`,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                AccessKey: lesson.parentCourse.BUNNY_LIBRARY_API_KEY,
            },
            data: JSON.stringify({ title: req.file.originalname }),
        };

        await axios
            .request(optionsToCreateVideo)
            .then((response) => {
                video_id = response.data.guid;
                const video = req.file.buffer;
                axios.put(`http://video.bunnycdn.com/library/${lesson.parentCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/${video_id}`,
                    video, {
                    headers: {
                        Accept: "application/json",
                        'Content-Type': 'application/json',
                        AccessKey: lesson.parentCourse.BUNNY_LIBRARY_API_KEY,
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
                    message: "failed to add lessonVideo!",
                    bunnyMessage: error.message
                });
            });
        // add new video in databse
        await LessonVideo.create({
            Video_ID: video_id,
            Iframe_URL: `https://iframe.mediadelivery.net/embed/${lesson.parentCourse.BUNNY_VIDEO_LIBRARY_ID}/${video_id}`,
            Direct_Play_URL: `https://iframe.mediadelivery.net/play/${lesson.parentCourse.BUNNY_VIDEO_LIBRARY_ID}/${video_id}`,
            courseId: courseId,
            sectionId: sectionId,
            lessonId: lessonId,
            BUNNY_VIDEO_LIBRARY_ID: lesson.parentCourse.BUNNY_VIDEO_LIBRARY_ID,
            BUNNY_LIBRARY_API_KEY: lesson.parentCourse.BUNNY_LIBRARY_API_KEY
        });
        res.status(201).send({
            success: true,
            message: `Lesson's video uploaded successfully!`
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

exports.deleteLessonVideo = async (req, res) => {
    try {
        const id = req.params.id;
        const lessonVideo = await LessonVideo.findOne({ where: { id: id } });
        if (!lessonVideo) {
            return res.status(400).send({
                success: false,
                message: "Lesson Video is not present!"
            });
        };
        // delete video from bunny
        const deleteVideo = {
            method: "DELETE",
            url: `http://video.bunnycdn.com/library/${lessonVideo.BUNNY_VIDEO_LIBRARY_ID}/videos/${lessonVideo.Video_ID}`,
            headers: {
                AccessKey: lessonVideo.BUNNY_LIBRARY_API_KEY,
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
        // delete lesson from database
        if (lessonVideo.Thumbnail_URL) {
            deleteSingleFile(lessonVideo.Thumbnail_URL);
        }
        // delete comment files
        const comment = await VideoComment.findAll({ where: { lessonVideoId: id } });
        const fileArray = [];
        for (let i = 0; i < comment.length; i++) {
            fileArray.push(comment[i].filePath);
        }
        if (fileArray.length > 0) {
            deleteMultiFile(fileArray);
        }
        // delete lesson video
        await lessonVideo.destroy();
        res.status(200).send({
            success: true,
            message: `Lesson Video deleted successfully!`
        });
    } catch (err) {
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
        const lessonVideo = await LessonVideo.findOne({
            where: { id: id },
        });
        if (!lessonVideo) {
            return res.status(400).send({
                success: false,
                message: "Lesson Video is not present!"
            });
        };
        // add to buuny video
        const setThumbNail = {
            method: "POST",
            url: `http://video.bunnycdn.com/library/${lessonVideo.BUNNY_VIDEO_LIBRARY_ID}/videos/${lessonVideo.Video_ID}/thumbnail`,
            params: {
                thumbnailUrl: req.file.path
            },
            headers: {
                Accept: "application/json",
                AccessKey: lessonVideo.BUNNY_LIBRARY_API_KEY,
            }
        };
        await axios
            .request(setThumbNail)
            .then((response) => {
                // console.log("resposse: ", response.data);
            })
            .catch((error) => {
                // console.log(error);
                deleteSingleFile(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: "failed to upload thumbnail! upload again",
                    bunnyMessage: error.message
                });
            });
        // delete existing file
        let message = "added";
        if (lessonVideo.Thumbnail_URL) {
            deleteSingleFile(lessonVideo.Thumbnail_URL);
            message = "updated";
        }
        await lessonVideo.update({
            ...lessonVideo,
            Thumbnail_URL: req.file.path
        });
        res.status(201).send({
            success: true,
            message: `Lesson's video thumbnail ${message} successfully!`
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

exports.getAllVideoByLessonId = async (req, res) => {
    try {
        const lessonVideo = await LessonVideo.findAll({
            where: {
                lessonId: req.params.lessonId
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "Video fetched successfully!",
            data: lessonVideo
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};