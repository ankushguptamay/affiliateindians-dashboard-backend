const { Op } = require('sequelize');
const db = require('../../../Models');
const Section = db.section
const Lesson = db.lesson;
const Course = db.course;
const User_Course = db.user_course;
const LessonFile = db.lessonFile;
const LessonVideo = db.lessonVideo;
const VideoComment = db.videoComment;
const Assignment = db.assignment;
const LessonQuiz = db.lessonQuiz;
const axios = require('axios');
const { deleteMultiFile } = require("../../../Util/deleteFile")

// createSection
// getAllSectionByCourseId for admin
// updateSection
// publicSection
// deleteSection

exports.createSection = async (req, res) => {
    try {
        await Section.create({
            courseId: req.body.courseId,
            sectionName: req.body.sectionName,
            adminId: req.admin.id
        });
        res.status(201).send({
            success: true,
            message: `section added successfully!`
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

exports.getAllSectionByCourseIdForAdmin = async (req, res) => {
    try {
        const condition = [{ courseId: req.params.courseId }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: req.admin.id });
        }
        const course = await Course.findOne({
            where: {
                id: req.params.courseId
            },
            attributes: ["id", "title", "isPublic", "createdAt"]
        });
        const section = await Section.findAll({
            where: {
                [Op.and]: condition
            },
            include: [{
                model: Lesson,
                as: "lessons",
                attributes: ["id", "lessonName", "isPublic", "createdAt"],
                // order: [
                //     ['createdAt', 'ASC']
                // ],
                include: [{
                    model: LessonVideo,
                    as: "lessonVideos",
                    // order: [
                    //     ['createdAt', 'ASC']
                    // ]
                }, {
                    model: LessonFile,
                    as: "lessonFiles",
                    // order: [
                    //     ['fileName', 'ASC'],
                    //     ['createdAt', 'ASC']
                    // ]
                }, {
                    model: LessonQuiz,
                    as: "lessonQuizs",
                    // order: [
                    //     ['createdAt', 'ASC']
                    // ]
                }, {
                    model: Assignment,
                    as: "assignment",
                    // order: [
                    //     ['createdAt', 'ASC']
                    // ]
                }]
            }],
            order: [
                ['createdAt', 'ASC'],
                [{ model: Lesson, as: "lessons" }, 'createdAt', 'ASC'],
                [{ model: Lesson, as: "lessons" }, { model: LessonVideo, as: "lessonVideos" }, 'createdAt', 'ASC'],
                [{ model: Lesson, as: "lessons" }, { model: LessonFile, as: "lessonFiles" }, 'createdAt', 'ASC'],
                [{ model: Lesson, as: "lessons" }, { model: LessonQuiz, as: "lessonQuizs" }, 'createdAt', 'ASC'],
                [{ model: Lesson, as: "lessons" }, { model: Assignment, as: "assignment" }, 'createdAt', 'ASC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "section fetched successfully!",
            data: section,
            course: course
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getAllSectionByCourseIdForUser = async (req, res) => {
    try {
        const course = await Course.findOne({
            where: {
                id: req.params.courseId,
                isPublic: true
            },
            attributes: ["id", "title", "isPublic", "createdAt"]
        });
        const section = await Section.findAll({
            where: {
                courseId: req.params.courseId,
                isPublic: true
            },
            include: [{
                model: Lesson,
                where: {
                    isPublic: true
                },
                required: false,
                as: "lessons",
                attributes: ["id", "lessonName", "isPublic", "createdAt"],
                order: [
                    ['createdAt', 'ASC']
                ],
                include: [{
                    model: LessonVideo,
                    as: "lessonVideos",
                    order: [
                        ['createdAt', 'ASC']
                    ]
                }, {
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
                        ['createdAt', 'ASC']
                    ]
                }, {
                    model: Assignment,
                    as: "assignment",
                    order: [
                        ['createdAt', 'ASC']
                    ]
                }]
            }],
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (course.isPaid === true) {
            const isPurchase = await User_Course.findOne({
                where: {
                    courseId: req.params.courseId,
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
            message: "section fetched successfully!",
            data: section,
            course: course
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.hardeleteSection = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const section = await Section.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!section) {
            return res.status(400).send({
                success: false,
                message: "Section is not present!"
            });
        };
        const commentFileArray = [];
        const lessonFileArray = [];
        const thumbnailArray = [];
        // hard Delete Lesson video 
        const video = await LessonVideo.findAll({
            where:
            {
                sectionId: id,
                videoType: "VIDEO"
            }
        });
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
            }
        }
        // delete thumbnail
        if (thumbnailArray.length > 0) {
            deleteMultiFile(thumbnailArray);
        }
        // delete comment Files
        const comment = await VideoComment.findAll({ where: { sectionId: id } });
        for (let i = 0; i < comment.length; i++) {
            commentFileArray.push(comment[i].file_Path);
        }
        if (commentFileArray.length > 0) {
            deleteMultiFile(commentFileArray);
        }
        // delete lesson files
        const lessonFile = await LessonFile.findAll({ where: { sectionId: id } });
        for (let i = 0; i < lessonFile.length; i++) {
            lessonFileArray.push(lessonFile[i].file_Path);
        }
        if (lessonFileArray.length > 0) {
            deleteMultiFile(lessonFileArray);
        }
        // delete video from database
        await LessonVideo.destroy({
            where: {
                sectionId: id
            }, force: true
        });
        // delete VideoComment from database
        await VideoComment.destroy({
            where: {
                sectionId: id
            }, force: true
        });
        // delete LessonFile from database
        await LessonFile.destroy({
            where: {
                sectionId: id
            }, force: true
        });
        // delete quiz from database
        await LessonQuiz.destroy({
            where: {
                sectionId: id
            }, force: true
        });
        // delete lesson from database
        await Lesson.destroy({
            where: {
                sectionId: id
            }, force: true
        });

        // delete section from database
        await section.destroy({ force: true });
        res.status(200).send({
            success: true,
            message: `Section deleted seccessfully! ID: ${id}`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.updateSection = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const section = await Section.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!section) {
            return res.status(400).send({
                success: false,
                message: "Section is not present!"
            });
        };
        await section.update({
            ...section,
            sectionName: req.body.sectionName
        });
        res.status(200).send({
            success: true,
            message: `Section Name updated seccessfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.publicSection = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const section = await Section.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!section) {
            return res.status(400).send({
                success: false,
                message: "Section is not present!"
            });
        };
        await section.update({
            ...section,
            isPublic: true
        });
        res.status(200).send({
            success: true,
            message: `Section publiced seccessfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.unPublicSection = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const section = await Section.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!section) {
            return res.status(400).send({
                success: false,
                message: "Section is not present!"
            });
        };
        await section.update({
            ...section,
            isPublic: false
        });
        res.status(200).send({
            success: true,
            message: `Section unpubliced seccessfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};