const { Op } = require('sequelize');
const db = require('../../../Models');
const Lesson = db.lesson;
const Course = db.course;
const LessonVideo = db.lessonVideo;
const VideoComment = db.videoComment;
const { deleteSingleFile, deleteMultiFile } = require("../../../Util/deleteFile");
const { videoEmbeddedCodeValidation } = require("../../../Middlewares/Validate/validateCourse");
const axios = require('axios');
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// uploadLessonVideo
// deleteLessonVideo
// addOrUpdateThumbNail
// getAllVideoByLessonId

exports.uploadLessonVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a file!"
            });
        }
        if ((req.file.mimetype).startsWith("video") === false) {
            return res.status(400).send({
                success: false,
                message: "Select only video!"
            });
        }
        // find lesson
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
        const lessonVideo = await LessonVideo.create({
            Video_ID: video_id,
            Iframe_URL: `https://iframe.mediadelivery.net/embed/${lesson.parentCourse.BUNNY_VIDEO_LIBRARY_ID}/${video_id}`,
            Direct_Play_URL: `https://iframe.mediadelivery.net/play/${lesson.parentCourse.BUNNY_VIDEO_LIBRARY_ID}/${video_id}`,
            courseId: lesson.courseId,
            sectionId: lesson.sectionId,
            lessonId: lessonId,
            BUNNY_VIDEO_LIBRARY_ID: lesson.parentCourse.BUNNY_VIDEO_LIBRARY_ID,
            BUNNY_LIBRARY_API_KEY: lesson.parentCourse.BUNNY_LIBRARY_API_KEY,
            adminId: req.admin.id,
            videoType: "VIDEO",
            videoName: req.file.originalname
        });
        res.status(201).send({
            success: true,
            message: `Lesson's video uploaded successfully!`,
            data: lessonVideo
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

exports.hardDeleteLessonVideo = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const lessonVideo = await LessonVideo.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!lessonVideo) {
            return res.status(400).send({
                success: false,
                message: "Lesson Video is not present!"
            });
        };
        if (lessonVideo.videoType === "VIDEO") {
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
        }
        // delete thumbnail from cloudinary
        if (lessonVideo.cloudinaryImageId) {
            await cloudinary.uploader.destroy(lessonVideo.cloudinaryImageId);
        }
        // delete comment files
        const comment = await VideoComment.findAll({ where: { lessonVideoId: id } });
        const fileArray = [];
        for (let i = 0; i < comment.length; i++) {
            fileArray.push(comment[i].file_Path);
            await comment[i].destroy({ force: true });
        }
        if (fileArray.length > 0) {
            deleteMultiFile(fileArray);
        }
        // delete lesson video
        await lessonVideo.destroy({ force: true });
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
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const lessonVideo = await LessonVideo.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!lessonVideo) {
            return res.status(400).send({
                success: false,
                message: "Lesson Video is not present!"
            });
        };
        // Upload image to cloudinary
        const imagePath = `./Resources/Lesson/${req.file.filename}`
        const image = await cloudinary.uploader.upload(imagePath);
        // delete file from resource
        deleteSingleFile(req.file.path);
        if (lessonVideo.videoType === "VIDEO") {
            // add to buuny video
            const setThumbNail = {
                method: "POST",
                url: `http://video.bunnycdn.com/library/${lessonVideo.BUNNY_VIDEO_LIBRARY_ID}/videos/${lessonVideo.Video_ID}/thumbnail`,
                params: {
                    thumbnailUrl: image.secure_url
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
                    cloudinary.uploader.destroy(image.public_id);
                    return res.status(400).json({
                        success: false,
                        message: "failed to upload thumbnail! upload again",
                        bunnyMessage: error.message
                    });
                });
        }
        // delete existing file
        let message = "added";
        if (lessonVideo.cloudinaryImageId) {
            await cloudinary.uploader.destroy(lessonVideo.cloudinaryImageId);
            message = "updated";
        }
        await lessonVideo.update({
            ...lessonVideo,
            Thumbnail_Path: image.secure_url,
            cloudinaryImageId: image.public_id,
            Thumbnail_OriginalName: req.file.originalname,
            Thumbnail_FileName: req.file.filename
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
        // Updating encoding video
        const findEncodeingVideo = await LessonVideo.findAll({
            where: {
                lessonId: req.params.lessonId,
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

// exports.purgeURL = async (req, res) => {
//     try {
//         const response = axios.get('https://api.bunny.net/purge?url=https://vz-6731cad9-a20.b-cdn.net/embed/143408/8e246425-d4f3-464c-be48-cebead0fd48f&async=false',
//             {
//                 headers: {
//                     Accept: "application/json",
//                     'Content-Type': 'application/json',
//                     AccessKey: process.env.BUNNY_ACCOUNT_ACCESS_KEY,
//                 }
//             });
//         res.status(200).send({
//             success: true,
//             message: "Video fetched successfully!",
//             data: response
//         });
//     } catch (err) {
//         // console.log(err);
//         res.status(500).send({
//             success: false,
//             err: err
//         });
//     }
// };

exports.uploadVideoEmbeddedCode = async (req, res) => {
    try {
        // Validate Body
        const { error } = videoEmbeddedCodeValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const lessonId = req.params.lessonId;
        const lesson = await Lesson.findOne({
            where: {
                id: lessonId,
                adminId: req.admin.id
            }
        });
        if (!lesson) {
            return res.status(400).send({
                success: false,
                message: "Lesson is not present!"
            });
        }
        const { embeddedCode, videoName } = req.body;
        // add new video in databse
        await LessonVideo.create({
            courseId: lesson.courseId,
            sectionId: lesson.sectionId,
            lessonId: lessonId,
            adminId: req.admin.id,
            videoType: "EMBEDDEDCODE",
            videoName: videoName,
            embeddedVideoCode: embeddedCode
        });
        res.status(201).send({
            success: true,
            message: `Lesson's video uploaded successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};