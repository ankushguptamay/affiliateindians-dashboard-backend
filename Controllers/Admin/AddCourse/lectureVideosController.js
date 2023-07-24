const db = require('../../../Models');
const Lecture = db.lecture;
const Course = db.course;
const LecturesVideo = db.lectureVideo;
const { deleteFile } = require("../../../Util/deleteFile");
const axios = require('axios');

exports.uploadLectureVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a video!"
            });
        }
        // find lecture
        const {courseId , sectionId} = req.body;
        const lectureId = req.params.lectureId;
        const lecture = await Lecture.findOne({
            where: { id: lectureId },
            include: [{
                model: Course,
                as: 'parentCourse'
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
            url: `http://video.bunnycdn.com/library/${lecture.parentCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/`,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                AccessKey: lecture.parentCourse.BUNNY_LIBRARY_API_KEY,
            },
            data: JSON.stringify({ title: lecture.lessonName }),
        };

        await axios
            .request(optionsToCreateVideo)
            .then((response) => {
                video_id = response.data.guid;
                const video = req.file.buffer;
                axios.put(`http://video.bunnycdn.com/library/${lecture.parentCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/${video_id}`,
                    video, {
                    headers: {
                        Accept: "application/json",
                        'Content-Type': 'application/json',
                        AccessKey: lecture.parentCourse.BUNNY_LIBRARY_API_KEY,
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
        await LecturesVideo.create({
            Video_ID: video_id,
            Iframe_URL: `https://iframe.mediadelivery.net/embed/${lecture.parentCourse.BUNNY_VIDEO_LIBRARY_ID}/${video_id}`,
            Direct_Play_URL: `https://iframe.mediadelivery.net/play/${lecture.parentCourse.BUNNY_VIDEO_LIBRARY_ID}/${video_id}`,
            courseId:courseId,
            sectionId:sectionId,
            lectureId:lectureId,
            BUNNY_VIDEO_LIBRARY_ID:lecture.parentCourse.BUNNY_VIDEO_LIBRARY_ID,
            BUNNY_LIBRARY_API_KEY:lecture.parentCourse.BUNNY_LIBRARY_API_KEY
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

exports.deleteLectureVideo = async (req, res) => {
    try {
        const id = req.params.id;
        const lectureVideo = await LecturesVideo.findOne({ where: { id: id } });
        if (!lectureVideo) {
            return res.status(400).send({
                success: false,
                message: "Lesson Video is not present!"
            });
        };
        // delete video from bunny
        const deleteVideo = {
            method: "DELETE",
            url: `http://video.bunnycdn.com/library/${lectureVideo.BUNNY_VIDEO_LIBRARY_ID}/videos/${lectureVideo.Video_ID}`,
            headers: {
                AccessKey: lectureVideo.BUNNY_LIBRARY_API_KEY,
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
        await lectureVideo.destroy();
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