const db = require('../../../Models');
const Course = db.course;
const Lecture = db.lecture;
const { deleteFile, deleteMultiFile } = require("../../../Util/deleteFile")
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
        console.log(err);
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
        console.log(err);
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
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

// delete file from bunny video and library
// exports.deleteCourse = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const course = await Course.findOne({ where: { id: id } });
//         if (!course) {
//             return res.status(400).send({ message: "Course is not present!" });
//         };
//         const sections = await Section.findAll({ where: { courseId: id }, attributes: ["id"] });
//         const lectures = [];
//         for (let i = 0; i < sections.length; i++) {
//             lectures.push(await Lecture.findAll({ where: { section_id: sections[i].id }, attributes: ["file", "Thumbnail_URL"] }));
//         }
//         const fileArray = [];
//         const thunbnailArray = [];
//         for (let i = 0; i < lectures.length; i++) {
//             for (let j = 0; j < lectures[i].length; j++) {
//                 if (lectures[i][j].file) {
//                     fileArray.push(lectures[i][j].file);
//                 }
//                 if (lectures[i][j].Thumbnail_URL) {
//                     thunbnailArray.push(lectures[i][j].Thumbnail_URL);
//                 }
//             }
//         }
//         deleteMultiFile(fileArray);
//         deleteFile(addCourse.authorImage);
//         deleteFile(addCourse.courseImage);
//         await addCourse.destroy({ where: { id: id } });
//         res.status(200).send({ message: `AddCourse deleted successfully! ID: ${id}` });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send({ success: false,
// err: err.message});
//     }
// };

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
                PlayerKeyColor:PlayerKeyColor // "#55ff60" their are more option, check it on bunny 
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
        console.log(err);
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
            deleteFile(course.courseImage);
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
        console.log(err);
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
            deleteFile(course.authorImage);
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
        console.log(err);
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
            deleteFile(course.courseImage);
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
        console.log(err);
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
            deleteFile(course.authorImage);
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
        console.log(err);
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
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};