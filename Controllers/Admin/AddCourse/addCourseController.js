const { AddCourse, Section, Lecture } = require('../../../Models');
const { deleteFile, deleteMultiFile } = require("../../../Util/deleteFile")
const axios = require('axios');
const { Op } = require('sequelize');

exports.createAddCourse = async (req, res) => {
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
        // Add in database  
        await AddCourse.create({
            title: title,
            subTitle: subTitle,
            authorName: authorName,
            categories: categories,
            BUNNY_VIDEO_LIBRARY_ID: response.data.Id,
            BUNNY_LIBRARY_API_KEY: response.data.ApiKey,
            admin_id: req.admin.id
        });
        res.status(201).send({
            success: true,
            message: `AddCourse added successfully!`
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

// for admin panal
exports.getAddCourseForAdmin = async (req, res) => {
    try {
        const addCourse = await AddCourse.findAll({
            where: {
                admin_id: req.admin.id
            },
            include: [{
                model: Section,
                as: "sections",
                attributes: ["id", "sectionName"]
            }],
            order: [
                ['createdAt', 'ASC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "AddCourse fetched successfully!",
            data: addCourse
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

// for User panel
exports.getAddCourseForUser = async (req, res) => {
    try {
        const addCourse = await AddCourse.findAll({
            where: {
                isPublic: true
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "AddCourse fetched successfully!",
            data: addCourse
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

// for admin User
exports.getAddCourseById = async (req, res) => {
    try {
        const id = req.params.id;
        // is add course present
        const addCourse = await AddCourse.findOne({
            where: {
                id: id
            }
        });
        if (!addCourse) {
            return res.status(400).send({
                success: false,
                message: "AddCourse is not present!"
            });
        }
        res.status(200).send({
            success: true,
            message: "AddCourse fetched successfully!",
            data: addCourse
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
// exports.deleteAddCourse = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const addCourse = await AddCourse.findOne({ where: { id: id } });
//         if (!addCourse) {
//             return res.status(400).send({ message: "AddCourse is not present!" });
//         };
//         const sections = await Section.findAll({ where: { addCourse_id: id }, attributes: ["id"] });
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

exports.updateAddCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const { title, subTitle, categories, authorName } = req.body;
        // is add course present
        const addCourse = await AddCourse.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { admin_id: adminId }
                    ]
            }
        });
        if (!addCourse) {
            return res.status(400).send({
                success: false,
                message: "AddCourse is not present!"
            });
        }
        // update title name
        const updateVideoLibrary = {
            method: "POST",
            url: `https://api.bunny.net/videolibrary/${addCourse.BUNNY_VIDEO_LIBRARY_ID}`,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                AccessKey: process.env.BUNNY_ACCOUNT_ACCESS_KEY,
            },
            data: {
                Name: title
                // PlayerKeyColor: "#55ff60" // their are more option, check it on bunny 
            }
        };
        const response = await axios.request(updateVideoLibrary);
        // update in database
        await addCourse.update({
            ...addCourse,
            title: title,
            subTitle: subTitle,
            authorName: authorName,
            categories: categories
        });
        res.status(200).send({
            success: true,
            message: `AddCourse modified successfully!`
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
        // is add course present
        const addCourse = await AddCourse.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { admin_id: adminId }
                    ]
            }
        });
        if (!addCourse) {
            return res.status(400).send({
                success: false,
                message: "AddCourse is not present!"
            });
        }
        // delete file if present
        let message = "added"
        if (addCourse.courseImage) {
            deleteFile(addCourse.courseImage);
            message = "updated"
        }
        // update courseImage
        await addCourse.update({
            ...addCourse,
            courseImage: req.file.path,
        });
        res.status(201).send({
            success: true,
            message: `AddCourse Image ${message} successfully!`
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
        // is add course present 
        const adminId = req.admin.id;
        const addCourse = await AddCourse.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { admin_id: adminId }
                    ]
            }
        });
        if (!addCourse) {
            return res.status(400).send({
                success: false,
                message: "AddCourse is not present!"
            });
        }
        // delete file if present
        let message = "added"
        if (addCourse.authorImage) {
            deleteFile(addCourse.authorImage);
            message = "updated"
        }
        // update authorImage
        await addCourse.update({
            ...addCourse,
            authorImage: req.file.path,
        });
        res.status(201).send({
            success: true,
            message: `AddCourse Author Image ${message} successfully!`
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
        // is add course present
        const addCourse = await AddCourse.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { admin_id: adminId }
                    ]
            }
        });
        if (!addCourse) {
            return res.status(400).send({
                success: false,
                message: "AddCourse is not present!"
            });
        }
        // delete file if present
        if (addCourse.courseImage) {
            deleteFile(addCourse.courseImage);
        }
        // update courseImage
        await addCourse.update({
            ...addCourse,
            courseImage: null,
        });
        res.status(200).send({
            success: true,
            message: `AddCourse Image deleted successfully!`
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
        // is add course present
        const addCourse = await AddCourse.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { admin_id: adminId }
                    ]
            }
        });
        if (!addCourse) {
            return res.status(400).send({
                success: false,
                message: "AddCourse is not present!"
            });
        }
        // delete file
        if (addCourse.authorImage) {
            deleteFile(addCourse.authorImage);
        }
        // update authorImage
        await addCourse.update({
            ...addCourse,
            authorImage: null,
        });
        res.status(200).send({
            success: true,
            message: `AddCourse Author Image deleted successfully!`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.publicAddCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        // is add course present
        const addCourse = await AddCourse.findOne({
            where: {
                [Op.and]:
                    [
                        { id: id }, { admin_id: adminId }
                    ]
            }
        });
        if (!addCourse) {
            return res.status(400).send({
                success: false,
                message: "AddCourse is not present!"
            });
        }
        // update isPublice
        await addCourse.update({
            ...addCourse,
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