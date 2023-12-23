const db = require('../../../Models');
const Course = db.course;
const User_Course = db.user_course;
const Coupon = db.coupon;
const Course_Coupon = db.course_coupon;
const Lesson = db.lesson;
const LessonFile = db.lessonFile;
const LessonVideo = db.lessonVideo;
const VideoComment = db.videoComment;
const LessonQuiz = db.lessonQuiz;
const Section = db.section
const LessonText = db.lessonText;
const AffiliateMarketingRatio = db.affiliateMarketingRatio;
const { deleteSingleFile, deleteMultiFile } = require("../../../Util/deleteFile");
const { courseValidation } = require("../../../Middlewares/Validate/validateCourse");
const axios = require('axios');
const cloudinary = require("cloudinary").v2;
const { Op } = require('sequelize');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// createCourse in this route Title is required.
// getCourseForAdmin
// getCourseForUser
// updateCourse
// addOrUpdateCourseImage
// addOrUpdateAuthorImage
// deleteCourseImage
// deleteAuthorImage
// publishCourse
// deleteCourse

exports.createCourse = async (req, res) => {
    try {
        // Validate Body
        const { error } = courseValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { title } = req.body;
        // Always unique title
        const courseTitle = title.toUpperCase();
        const isCourse = await Course.findOne({
            where: {
                title: courseTitle
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
            data: { name: courseTitle }
        };
        const response = await axios.request(createVideoLibrary);
        // console.log(response);
        // Store in database  
        await Course.create({
            title: courseTitle,
            BUNNY_VIDEO_LIBRARY_ID: response.data.Id,
            BUNNY_LIBRARY_API_KEY: response.data.ApiKey,
            adminId: req.admin.id,
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
            include: [{
                model: Course_Coupon,
                as: "course_coupons",
                where: {
                    type: "DEFAULT"
                },
                required: false,
                include: [{
                    model: Coupon,
                    as: "coupon"
                }]
            }],
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
        if (!req.admin) {
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
            include: [{
                model: Course_Coupon,
                as: "course_coupons",
                where: {
                    type: "DEFAULT"
                },
                required: false,
                include: [{
                    model: Coupon,
                    as: "coupon"
                }]
            }],
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
                userId: req.user.id,
                verify: true,
                status: "paid"
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

exports.getCourseById = async (req, res) => {
    try {
        // All Course
        const course = await Course.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: Course_Coupon,
                as: "course_coupons",
                where: {
                    type: "DEFAULT"
                },
                required: false,
                include: [{
                    model: Coupon,
                    as: "coupon"
                }]
            }],
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

exports.hardDeleteCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
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
        };
        const commentFileArray = [];
        // hard Delete Lesson video 
        const video = await LessonVideo.findAll({
            where:
            {
                courseId: id,
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
                // delete thumbnail from cloudinary
                if (video[i].cloudinaryImageId) {
                    await cloudinary.uploader.destroy(video[i].cloudinaryImageId);
                }
            }
        }
        // delete comment Files
        const comment = await VideoComment.findAll({ where: { courseId: id } });
        for (let i = 0; i < comment.length; i++) {
            commentFileArray.push(comment[i].file_Path);
        }
        if (commentFileArray.length > 0) {
            deleteMultiFile(commentFileArray);
        }
        // delete lesson files
        const lessonFile = await LessonFile.findAll({ where: { courseId: id } });
        for (let i = 0; i < lessonFile.length; i++) {
            if (lessonFile[i].cloudinaryFileId) {
                await cloudinary.uploader.destroy(lessonFile[i].cloudinaryFileId);
            }
        }
        // delete video from database
        await LessonVideo.destroy({
            where: {
                courseId: id
            }, force: true
        });
        // delete VideoComment from database
        await VideoComment.destroy({
            where: {
                courseId: id
            }, force: true
        });
        // delete lessonText from database
        await LessonText.destroy({
            where: {
                courseId: id
            }, force: true
        });
        // delete LessonFile from database
        await LessonFile.destroy({
            where: {
                courseId: id
            }, force: true
        });
        // delete quiz from database
        await LessonQuiz.destroy({
            where: {
                courseId: id
            }, force: true
        });
        // delete lesson from database
        await Lesson.destroy({
            where: {
                courseId: id
            }, force: true
        });
        // delete section from database
        await Section.destroy({
            where: {
                courseId: id
            }, force: true
        });
        // delete coupon association from databasea
        await Course_Coupon.destroy({
            where: {
                courseId: id
            }, force: true
        });
        // delete course image
        if (course.courseImageCloudId) {
            await cloudinary.uploader.destroy(course.courseImageCloudId);
        }
        // delete author image
        if (course.authorImageCloudId) {
            await cloudinary.uploader.destroy(course.authorImageCloudId);
        }
        // Delete Library from bunny
        const deleteVideoLibrary = {
            method: "DELETE",
            url: `https://api.bunny.net/videolibrary/${course.BUNNY_VIDEO_LIBRARY_ID}`,
            headers: {
                Accept: "application/json",
                AccessKey: process.env.BUNNY_ACCOUNT_ACCESS_KEY,
            }
        };
        await axios
            .request(deleteVideoLibrary)
            .then((response) => {
            })
            .catch((error) => {
                return res.status(400).json({ error: "Library not deleted!" });
            });
        // delete course from database
        await course.destroy({ force: true });
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
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const { title, subTitle, categories, authorName, PlayerKeyColor, price, discription, currency, isPaid, ratioId } = req.body;
        if (!title) {
            return res.status(400).send({
                success: false,
                message: "Title should be present!"
            });
        }
        const courseTitle = title.toUpperCase();
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
        // update title name
        if (courseTitle !== course.title) {
            console.log("hiiii")
            const updateVideoLibrary = {
                method: "POST",
                url: `https://api.bunny.net/videolibrary/${course.BUNNY_VIDEO_LIBRARY_ID}`,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    AccessKey: process.env.BUNNY_ACCOUNT_ACCESS_KEY,
                },
                data: {
                    Name: courseTitle,
                    PlayerKeyColor: PlayerKeyColor // "#55ff60" their are more option, check it on bunny 
                }
            };
            const response = await axios.request(updateVideoLibrary);
            console.log(response);
        }
        // update in database
        await course.update({
            ...course,
            title: courseTitle,
            subTitle: subTitle,
            authorName: authorName,
            categories: categories,
            price: price,
            ratioId: ratioId,
            currency: currency,
            discription: discription,
            isPaid: isPaid
        });
        res.status(200).send({
            success: true,
            message: `Course modified successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err
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
        // Upload image to cloudinary
        const imagePath = `./Resources/Course/${req.file.filename}`
        const image = await cloudinary.uploader.upload(imagePath);
        // delete file from resource
        deleteSingleFile(req.file.path);
        // delete previous file if present
        let message = "added"
        if (course.courseImageCloudId) {
            await cloudinary.uploader.destroy(course.courseImageCloudId);
            message = "updated"
        }
        // update courseImage
        await course.update({
            ...course,
            courseImagePath: image.secure_url,
            courseImageFileName: req.file.filename,
            courseImageOriginalName: req.file.originalname,
            courseImageCloudId: image.public_id
        });
        res.status(201).send({
            success: true,
            message: `Course Image ${message} successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err
        });
    }
};

exports.addOrUpdateAuthorImage = async (req, res) => {
    try {
        const { authorName, authorDiscription } = req.body;
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
        let originalName = course.authorImageOriginalName, fileName = course.authorImageFileName, path = course.authorImagePath, imageId = course.authorImageCloudId;
        let message = "added";
        if (req.file) {
            originalName = req.file.originalname;
            fileName = req.file.filename;
            // Upload image to cloudinary
            const imagePath = `./Resources/Course/${req.file.filename}`
            const image = await cloudinary.uploader.upload(imagePath);
            path = image.secure_url;
            imageId = image.public_id;
            // delete file from resource
            deleteSingleFile(req.file.path);
            // delete file if present
            if (course.authorImageCloudId) {
                await cloudinary.uploader.destroy(course.authorImageCloudId);
                message = "updated";
            }
        }
        // update authorImage
        await course.update({
            ...course,
            authorImageOriginalName: originalName,
            authorImageFileName: fileName,
            authorImagePath: path,
            authorDiscription: authorDiscription,
            authorImageCloudId: imageId,
            authorName: authorName
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
        if (course.courseImageCloudId) {
            await cloudinary.uploader.destroy(course.courseImageCloudId);
        }
        // update courseImage
        await course.update({
            ...course,
            courseImageOriginalName: null,
            courseImageFileName: null,
            courseImagePath: null,
            courseImageCloudId: null
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
        if (course.authorImageCloudId) {
            await cloudinary.uploader.destroy(course.authorImageCloudId);
        }
        // update authorImage
        await course.update({
            ...course,
            authorImageOriginalName: null,
            authorImageFileName: null,
            authorImagePath: null,
            authorImageCloudId: null
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
            message: `Course published successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.unPublicCourse = async (req, res) => {
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
            isPublic: false
        });
        res.status(200).send({
            success: true,
            message: `Course unpublished successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.allowAffiliateCourse = async (req, res) => {
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
        // update allowAffiliate
        await course.update({
            ...course,
            allowAffiliate: true,
        });
        res.status(200).send({
            success: true,
            message: `Affiliate course successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.disAllowAffiliateCourse = async (req, res) => {
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
        // update allowAffiliate
        await course.update({
            ...course,
            allowAffiliate: false
        });
        res.status(200).send({
            success: true,
            message: `Disaffiliate course successfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getCourseByIdForUser = async (req, res) => {
    try {
        // find Course
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                isPublic: true
            },
            include: [{
                model: Section,
                as: "sections",
                where: {
                    isPublic: true
                },
                required: false,
            }, {
                model: Course_Coupon,
                as: "course_coupons",
                where: {
                    type: "DEFAULT"
                },
                required: false,
                include: [{
                    model: Coupon,
                    as: "coupon"
                }]
            }],
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
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

exports.changeBunnyCredential = async (req, res) => {
    try {
        const obj = [{
            courseName: "RESOURCES TO MAKE $1000-$5000 PER MONTH",
            BUNNY_VIDEO_LIBRARY_ID: "186693",
            BUNNY_LIBRARY_API_KEY: "dbcc2a48-0f98-4389-8d143e4a1caf-069c-4ea9"
        },
        {
            courseName: "10X FACEBOOK AD CAMPAIGN",
            BUNNY_VIDEO_LIBRARY_ID: "186613",
            BUNNY_LIBRARY_API_KEY: "c9bdca38-ebd9-41f6-9a270fa4c69b-0a7b-4706"
        },
        {
            courseName: "7. EXPERT MEMBERSHIP",
            BUNNY_VIDEO_LIBRARY_ID: "183803",
            BUNNY_LIBRARY_API_KEY: "be54c7fc-8a69-48bd-98c896c88bba-e78d-42df"
        },
        {
            courseName: "6. PRO MEMBERSHIP",
            BUNNY_VIDEO_LIBRARY_ID: "183802",
            BUNNY_LIBRARY_API_KEY: "b04a92cc-c5fc-4f37-ae5d8a19030a-853a-4de6"
        },
        {
            courseName: "5. BEGINNER MEMBERSHIP",
            BUNNY_VIDEO_LIBRARY_ID: "183801",
            BUNNY_LIBRARY_API_KEY: "c5d63160-d4e4-4c9f-836c77a59bc6-8e82-4b43"
        },
        {
            courseName: "4. CLICKBANK MASTERY",
            BUNNY_VIDEO_LIBRARY_ID: "182178",
            BUNNY_LIBRARY_API_KEY: "0d629496-5b7f-42e0-bb506e3341bf-d467-42a7"
        },
        {
            courseName: "3. YOUR BONUSES",
            BUNNY_VIDEO_LIBRARY_ID: "183804",
            BUNNY_LIBRARY_API_KEY: "0518c6f2-258d-44f7-b744a0ef2ca8-5d9d-408a"
        },
        {
            courseName: "2. BUSINESS BUILDER CHALLENGE",
            BUNNY_VIDEO_LIBRARY_ID: "182167",
            BUNNY_LIBRARY_API_KEY: "e8a77b2d-1823-40c6-97b46530ae27-a2e4-4d08"
        },
        {
            courseName: "1. 3-STEP HIGH TICKET AFFILIATE SYSTEM",
            BUNNY_VIDEO_LIBRARY_ID: "182095",
            BUNNY_LIBRARY_API_KEY: "9f1102f3-86ab-422b-ba0db96695ca-f067-4f28"
        },
        {
            courseName: "YOGA VOLUNTEER COURSE",
            BUNNY_VIDEO_LIBRARY_ID: "188000",
            BUNNY_LIBRARY_API_KEY: "e9f1f19a-b6b9-4046-b67bc96bd2a1-566d-4df2"
        },
        {
            courseName: "8. SUPER AFFILIATE MEMBERSHIP",
            BUNNY_VIDEO_LIBRARY_ID: "182510",
            BUNNY_LIBRARY_API_KEY: "83036b7b-0aca-4ac4-ae104d1c046b-7f43-4edd"
        }];
        let num = 0;
        let num1 = 0;
        for (let i = 0; i < obj.length; i++) {
            const course = await Course.findOne({
                where: {
                    title: obj[i].courseName
                }
            });
            if (course) {
                num = num + 1;
                const lessonVideo = await LessonVideo.findAll({
                    where: {
                        courseId: course.id,
                        videoType: "VIDEO"
                    }
                });
                for (let j = 0; j < lessonVideo.length; j++) {
                    num1 = num1 + 1;
                    await lessonVideo[j].update({
                        ...lessonVideo[j],
                        BUNNY_VIDEO_LIBRARY_ID: obj[i].BUNNY_VIDEO_LIBRARY_ID,
                        BUNNY_LIBRARY_API_KEY: obj[i].BUNNY_LIBRARY_API_KEY
                    });
                }
                await course.update({
                    ...course,
                    BUNNY_VIDEO_LIBRARY_ID: obj[i].BUNNY_VIDEO_LIBRARY_ID,
                    BUNNY_LIBRARY_API_KEY: obj[i].BUNNY_LIBRARY_API_KEY
                });
            }
        }

        res.status(200).send({
            success: true,
            message: `Course updated successfully! course ${num}, lesson ${num1}`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};