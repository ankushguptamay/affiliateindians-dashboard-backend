const db = require('../../../Models');
const Course = db.course;
const Lesson = db.lesson;
const { deleteSingleFile, deleteMultiFile } = require("../../../Util/deleteFile")
const axios = require('axios');
const { Op } = require('sequelize');

// createCourse in this route Title is required.
// getCourseForAdmin
// getCourseForUser
// updateCourse
// addOrUpdateCourseImage
// addOrUpdateAuthorImage
// deleteCourseImage
// deleteAuthorImage
// publicCourse
// deleteCourse

exports.createCourse = async (req, res) => {
    try {
        const { title, subTitle, categories, authorName } = req.body;
        if (!title) {
            return res.status(400).send({
                success: false,
                message: "Course title should be present!"
            });
        }
        // Create video library on bunny
        const createVideoLibrary = {
            method: "POST",
            url: `https://api.bunny.net/videolibrary`,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                AccessKey: process.env.BUNNY_ACCOUNT_ACCESS_KEY,
            },
            data: { name: title }
        };

        const response = await axios.request(createVideoLibrary);
        // console.log(response);
        // Store in database  
        await Course.create({
            title: title,
            subTitle: subTitle,
            authorName: authorName,
            categories: categories,
            BUNNY_VIDEO_LIBRARY_ID: response.data.Id,
            BUNNY_LIBRARY_API_KEY: response.data.ApiKey,
            adminId: req.admin.id
        });
        res.status(201).send({
            success: true,
            message: `Course added successfully!`
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

exports.getCourseForAdmin = async (req, res) => {
    try {
        const course = await Course.findAll({
            where: {
                adminId: req.admin.id
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "Course fetched successfully!",
            data: course
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getCourseForUser = async (req, res) => {
    try {
        const course = await Course.findAll({
            where: {
                isPublic: true
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "Course fetched successfully!",
            data: course
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const course = await Course.findOne({ where: { id: id } });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        };
        const section = await Section.findAll({ where: { courseId: id } });
        const commentFileArray = [];
        const lessonFileArray = [];
        const thumbnailArray = [];
        if (section.length > 0) {
            for (let i = 0; i < section.length; i++) {
                const lesson = await Lesson.findAll({ where: { sectionId: section[i].id } });
                if (lesson.length > 0) {
                    // delete associated video
                    for (let i = 0; i < lesson.length; i++) {
                        const video = await LessonVideo.findAll({ lessonId: lesson[i].id });
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
                                thumbnailArray.push(video[i].Thumbnail_URL);
                                const comment = await VideoComment.findAll({ where: { lessonVideoId: video[i].id } });
                                for (let i = 0; i < comment.length; i++) {
                                    commentFileArray.push(comment[i].filePath);
                                }
                            }
                        }
                        const lessonFile = await LessonFile.findAll({ where: { lessonId: lesson[i].id } });
                        for (let i = 0; i < lessonFile.length; i++) {
                            lessonFileArray.push(lessonFile[i].filePath);
                        }
                    }
                }
            }
        }
        // delete thumbnail
        if (thumbnailArray.length > 0) {
            deleteMultiFile(thumbnailArray);
        }
        // delete comment file
        if (commentFileArray.length > 0) {
            deleteMultiFile(commentFileArray);
        }
        // delete lesson resource
        if (lessonFileArray.length > 0) {
            deleteMultiFile(lessonFileArray);
        }
        // delete course image
        if (course.courseImage) {
            deleteSingleFile(course.courseImage);
        }
        // delete author image
        if (course.authorImage) {
            deleteSingleFile(course.authorImage);
        }
        await course.destroy();
        res.status(200).send({
            success: true,
            message: `Course deleted successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const { title, subTitle, categories, authorName, PlayerKeyColor } = req.body;
        // is course present
        const course = await Course.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { adminId: adminId }
                    ]
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // update title name
        const updateVideoLibrary = {
            method: "POST",
            url: `https://api.bunny.net/videolibrary/${course.BUNNY_VIDEO_LIBRARY_ID}`,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                AccessKey: process.env.BUNNY_ACCOUNT_ACCESS_KEY,
            },
            data: {
                Name: title,
                PlayerKeyColor: PlayerKeyColor // "#55ff60" their are more option, check it on bunny 
            }
        };
        await axios.request(updateVideoLibrary);
        // update in database
        await course.update({
            ...course,
            title: title,
            subTitle: subTitle,
            authorName: authorName,
            categories: categories
        });
        res.status(200).send({
            success: true,
            message: `Course modified successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.addOrUpdateCourseImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a Course Image!"
            });
        }
        const id = req.params.id;
        const adminId = req.admin.id;
        // is course present
        const course = await Course.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { adminId: adminId }
                    ]
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // delete file if present
        let message = "added"
        if (course.courseImage) {
            deleteSingleFile(course.courseImage);
            message = "updated"
        }
        // update courseImage
        await course.update({
            ...course,
            courseImage: req.file.path,
        });
        res.status(201).send({
            success: true,
            message: `Course Image ${message} successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.addOrUpdateAuthorImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a Author Image!"
            });
        }
        const id = req.params.id;
        // is course present 
        const adminId = req.admin.id;
        const course = await Course.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { adminId: adminId }
                    ]
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // delete file if present
        let message = "added"
        if (course.authorImage) {
            deleteSingleFile(course.authorImage);
            message = "updated"
        }
        // update authorImage
        await course.update({
            ...course,
            authorImage: req.file.path,
        });
        res.status(201).send({
            success: true,
            message: `Course Author Image ${message} successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};


exports.deleteCourseImage = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        // is course present
        const course = await Course.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { adminId: adminId }
                    ]
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // delete file if present
        if (course.courseImage) {
            deleteSingleFile(course.courseImage);
        }
        // update courseImage
        await course.update({
            ...course,
            courseImage: null,
        });
        res.status(200).send({
            success: true,
            message: `Course Image deleted successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.deleteAuthorImage = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        // is course present
        const course = await Course.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { adminId: adminId }
                    ]
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // delete file
        if (course.authorImage) {
            deleteSingleFile(course.authorImage);
        }
        // update authorImage
        await course.update({
            ...course,
            authorImage: null,
        });
        res.status(200).send({
            success: true,
            message: `Course Author Image deleted successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.publicCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        // is course present
        const course = await Course.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { adminId: adminId }
                    ]
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // update isPublice
        await course.update({
            ...course,
            isPublic: true,
        });
        res.status(200).send({
            success: true,
            message: `Course publiced successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};