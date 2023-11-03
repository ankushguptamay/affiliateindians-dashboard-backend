const db = require('../../../Models');
const Course = db.course;
const User_Course = db.user_course;
const Lesson = db.lesson;
const LessonFile = db.lessonFile;
const LessonVideo = db.lessonVideo;
const VideoComment = db.videoComment;
const { deleteSingleFile, deleteMultiFile } = require("../../../Util/deleteFile");
const { courseValidation } = require("../../../Middlewares/Validate/validateCourse");
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
        // Validate Body
        const { error } = courseValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { title, ratioId } = req.body;
        // Always unique title
        const isCourse = await Course.findOne({
            where: {
                title: title.toUpperCase()
            },
            paranoid: false
        });
        if (isCourse) {
            return res.status(400).send({
                success: false,
                message: "This course title is already present!"
            })
        }
        // Generating Code
        // 1.Today Date
        const date = JSON.stringify(new Date((new Date).getTime() - (24 * 60 * 60 * 1000)));
        const today = `${date.slice(1, 12)}18:30:00.000Z`;
        // 2.Today Day
        const Day = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dayNumber = (new Date).getDay();
        // Get All Today Code
        let code;
        const isCourseCode = await Course.findAll({
            where: {
                createdAt: { [Op.gt]: today }
            },
            order: [
                ['createdAt', 'ASC']
            ],
            paranoid: false
        });
        const day = new Date().toISOString().slice(8, 10);
        const year = new Date().toISOString().slice(2, 4);
        const month = new Date().toISOString().slice(5, 7);
        if (isCourseCode.length == 0) {
            code = "AFCO" + day + month + year + Day[dayNumber] + 1;
        } else {
            let lastCode = isCourseCode[isCourseCode.length - 1];
            let lastDigits = lastCode.courseCode.substring(13);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "AFCO" + day + month + year + Day[dayNumber] + incrementedDigits;
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
            BUNNY_VIDEO_LIBRARY_ID: response.data.Id,
            BUNNY_LIBRARY_API_KEY: response.data.ApiKey,
            adminId: req.admin.id,
            ratioId: ratioId,
            courseCode: code
        });
        res.status(201).send({
            success: true,
            message: `Course added successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err
        });
    }
};

exports.getCourseForAdmin = async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        // Search 
        const condition = [{ adminId: req.admin.id }];
        if (search) {
            condition.push({
                [Op.or]: [
                    { title: { [Op.substring]: search } },
                    { categories: { [Op.substring]: search } },
                    { authorName: { [Op.substring]: search } }
                ]
            })
        }
        // Count All Course
        const totalCourse = await Course.count({
            where: {
                [Op.and]: condition
            }
        });
        // All Course
        const course = await Course.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "Course fetched successfully!",
            totalPage: Math.ceil(totalCourse / recordLimit),
            currentPage: currentPage,
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

exports.getAllCourse = async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        // Search 
        const condition = [];
        if (req.user) {
            condition.push({ isPublic: true });
        }
        if (search) {
            condition.push({
                [Op.or]: [
                    { title: { [Op.substring]: search } },
                    { categories: { [Op.substring]: search } },
                    { authorName: { [Op.substring]: search } }
                ]
            })
        }
        // Count All Course
        const totalCourse = await Course.count({
            where: {
                [Op.and]: condition
            }
        });
        // All Course
        const course = await Course.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "Course fetched successfully!",
            totalPage: Math.ceil(totalCourse / recordLimit),
            currentPage: currentPage,
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

exports.getUsersCourse = async (req, res) => {
    try {
        const purchase = await User_Course.findAll({
            where: {
                userId: req.user.id
            }
        });
        const courseId = [];
        for (let i = 0; i < purchase.length; i++) {
            courseId.push(purchase[i].courseId);
        }
        // All Course
        const course = await Course.findAll({
            where: {
                id: courseId,
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

// exports.deleteCourse = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const course = await Course.findOne({ where: { id: id } });
//         if (!course) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Course is not present!"
//             });
//         };
//         const section = await Section.findAll({ where: { courseId: id } });
//         const commentFileArray = [];
//         const lessonFileArray = [];
//         const thumbnailArray = [];
//         if (section.length > 0) {
//             for (let i = 0; i < section.length; i++) {
//                 const lesson = await Lesson.findAll({ where: { sectionId: section[i].id } });
//                 if (lesson.length > 0) {
//                     // delete associated video
//                     for (let i = 0; i < lesson.length; i++) {
//                         const video = await LessonVideo.findAll({ lessonId: lesson[i].id });
//                         if (video.length > 0) {
//                             // delete video from bunny
//                             for (let i = 0; i < video.length; i++) {
//                                 const deleteVideo = {
//                                     method: "DELETE",
//                                     url: `http://video.bunnycdn.com/library/${video[i].BUNNY_VIDEO_LIBRARY_ID}/videos/${video[i].Video_ID}`,
//                                     headers: {
//                                         AccessKey: video[i].BUNNY_LIBRARY_API_KEY,
//                                     }
//                                 };

//                                 await axios
//                                     .request(deleteVideo)
//                                     .then((response) => {
//                                         // console.log("delete: ", response.data);
//                                     })
//                                     .catch((error) => {
//                                         // console.log(error);
//                                         return res.status(400).send({
//                                             success: false,
//                                             message: "Delete request of video failed from bunny. try to delete again!",
//                                             bunnyMessage: error.message
//                                         });
//                                     });
//                                 thumbnailArray.push(video[i].Thumbnail_Path);
//                                 const comment = await VideoComment.findAll({ where: { lessonVideoId: video[i].id } });
//                                 for (let i = 0; i < comment.length; i++) {
//                                     commentFileArray.push(comment[i].file_Path);
//                                 }
//                             }
//                         }
//                         const lessonFile = await LessonFile.findAll({ where: { lessonId: lesson[i].id } });
//                         for (let i = 0; i < lessonFile.length; i++) {
//                             lessonFileArray.push(lessonFile[i].file_Path);
//                         }
//                     }
//                 }
//             }
//         }
//         // delete thumbnail
//         if (thumbnailArray.length > 0) {
//             deleteMultiFile(thumbnailArray);
//         }
//         // delete comment file
//         if (commentFileArray.length > 0) {
//             deleteMultiFile(commentFileArray);
//         }
//         // delete lesson resource
//         if (lessonFileArray.length > 0) {
//             deleteMultiFile(lessonFileArray);
//         }
//         // delete course image
//         if (course.courseImagePath) {
//             deleteSingleFile(course.courseImagePath);
//         }
//         // delete author image
//         if (course.authorImagePath) {
//             deleteSingleFile(course.authorImagePath);
//         }
//         await course.destroy();
//         res.status(200).send({
//             success: true,
//             message: `Course deleted successfully!`
//         });
//     } catch (err) {
//         // console.log(err);
//         res.status(500).send({
//             success: false,
//             err: err.message
//         });
//     }
// };

// exports.updateCourse = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const adminId = req.admin.id;
//         const { title, subTitle, categories, authorName, PlayerKeyColor } = req.body;
//         // is course present
//         const course = await Course.findOne({
//             where: {
//                 [Op.and]:
//                     [
//                         { id: id }, { adminId: adminId }
//                     ]
//             }
//         });
//         if (!course) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Course is not present!"
//             });
//         }
//         // update title name
//         const updateVideoLibrary = {
//             method: "POST",
//             url: `https://api.bunny.net/videolibrary/${course.BUNNY_VIDEO_LIBRARY_ID}`,
//             headers: {
//                 Accept: "application/json",
//                 "Content-Type": "application/json",
//                 AccessKey: process.env.BUNNY_ACCOUNT_ACCESS_KEY,
//             },
//             data: {
//                 Name: title,
//                 PlayerKeyColor: PlayerKeyColor // "#55ff60" their are more option, check it on bunny 
//             }
//         };
//         await axios.request(updateVideoLibrary);
//         // update in database
//         await course.update({
//             ...course,
//             title: title,
//             subTitle: subTitle,
//             authorName: authorName,
//             categories: categories
//         });
//         res.status(200).send({
//             success: true,
//             message: `Course modified successfully!`
//         });
//     } catch (err) {
//         // console.log(err);
//         res.status(500).send({
//             success: false,
//             err: err.message
//         });
//     }
// };

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
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        // is course present
        const course = await Course.findOne({
            where: {
                [Op.and]: condition
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
        if (course.courseImagePath) {
            deleteSingleFile(course.courseImagePath);
            message = "updated"
        }
        // update courseImage
        await course.update({
            ...course,
            courseImagePath: req.file.path,
            courseImageFileName: req.file.filename,
            courseImageOriginalName: req.file.originalname
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
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        // is course present 
        const course = await Course.findOne({
            where: {
                [Op.and]: condition
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
        if (course.authorImagePath) {
            deleteSingleFile(course.authorImagePath);
            message = "updated"
        }
        // update authorImage
        await course.update({
            ...course,
            authorImageOriginalName: req.file.originalname,
            authorImageFileName: req.file.filename,
            authorImagePath: req.file.path
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
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        // is course present
        const course = await Course.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // delete file if present
        if (course.courseImagePath) {
            deleteSingleFile(course.courseImagePath);
        }
        // update courseImage
        await course.update({
            ...course,
            courseImageOriginalName: null,
            courseImageFileName: null,
            courseImagePath: null,
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
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        // is course present
        const course = await Course.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // delete file
        if (course.authorImagePath) {
            deleteSingleFile(course.authorImagePath);
        }
        // update authorImage
        await course.update({
            ...course,
            authorImageOriginalName: null,
            authorImageFileName: null,
            authorImagePath: null,
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
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        // is course present
        const course = await Course.findOne({
            where: {
                [Op.and]: condition
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