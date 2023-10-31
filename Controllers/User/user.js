const db = require('../../Models');
const User = db.user;
const User_Course = db.user_course;
const Course = db.course;
const UserWallet = db.userWallet;
const { userRegistration, userLogin, changePassword } = require("../../Middlewares/Validate/validateUser");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// create
// login
// changePassword
// findUser
// findAllUser for admin
// delete for admin
// update

exports.create = async (req, res) => {
    try {
        // Validate body
        const { error } = userRegistration(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).send({
                success: false,
                message: "Password should be match!"
            });
        }
        const isUser = await User.findOne({
            where: {
                email: req.body.email
            }
        });
        if (isUser) {
            return res.status(400).send({
                success: false,
                message: "User is present! Login.."
            });
        }
        const salt = await bcrypt.genSalt(10);
        const bcPassword = await bcrypt.hash(req.body.password, salt);
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            pinCode: req.body.pinCode,
            password: bcPassword
        });
        // Creating Wallet
        await UserWallet.create({
            userId: user.id
        });
        const data = {
            id: isUser.id,
            email: isUser.email
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY_USER);
        res.status(201).send({
            success: true,
            message: `User added successfully!`,
            authToken: authToken
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        // Validate body
        const { error } = userLogin(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { email, password } = req.body;
        const isUser = await User.findOne({
            where: {
                email: email
            }
        });
        if (!isUser) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! try to login with currect credentials.'
            });
        }
        const compairPassword = await bcrypt.compare(password, isUser.password);
        if (!compairPassword) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! try to login with currect credentials.'
            });
        }
        const data = {
            id: isUser.id,
            email: isUser.email
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY_USER);
        res.status(201).send({
            success: true,
            message: "LogedIn successfully",
            authToken: authToken
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        // Validate body
        const { error } = changePassword(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { email, previousPassword, newPassword } = req.body;
        const isUser = await User.findOne({
            where: {
                id: req.user.id,
                email: email
            }
        });
        if (!isUser) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! try to login with currect credentials.'
            });
        }
        const compairPassword = await bcrypt.compare(previousPassword, isUser.password);
        if (!compairPassword) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! try to login with currect credentials.'
            });
        }
        const salt = await bcrypt.genSalt(10);
        const bcPassword = await bcrypt.hash(newPassword, salt);
        await isUser.update({
            ...isUser,
            password: bcPassword
        });
        const data = {
            id: isUser.id,
            email: isUser.email
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY_USER);
        res.status(201).send({
            success: true,
            message: "Password change successfully!",
            authToken: authToken
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.findUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.user.id
            }
        });
        if (!user) {
            return res.status(400).send({
                success: false,
                message: "User is not present!"
            });
        }
        res.status(200).send({
            success: true,
            message: `User fetched successfully!`,
            data: user
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// exports.delete = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const users = await User.findOne({ where: { id: id } });
//         if (!users) {
//             return res.status(400).send({
//                 success: false,
//                 message: "User is not present"
//             })
//         }
//         users.destroy();
//         res.status(200).send({
//             success: true,
//             message: `User deleted successfully!`
//         });
//     } catch (err) {
//        res.status(500).send({ message: err.message });
//     }
// };

// exports.update = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const users = await User.findOne({ where: { id: id } });
//         if (!users) {
//             return res.status(400).send({
//                 success: false,
//                 message: "User is not present"
//             })
//         }
//         users.update({
//             name: req.body.name,
//             // email: req.body.email,
//             mobileNumber: req.body.mobileNumber,
//             address: req.body.address,
//             // city: req.body.city,
//             // state: req.body.state,
//             // country: req.body.country,
//             pinCode: req.body.pinCode
//         });
//         res.status(200).send({
//             success: true,
//             message: `User updated successfully!`
//         });
//     } catch (err) {
//           res.status(500).send({ message: err.message });
//     }
// };

exports.findUserForSuperAdmin = async (req, res) => {
    try {
        const { page, limit, search, courseId } = req.query;
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
        if (search) {
            condition.push({
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { mobileNumber: { [Op.substring]: search } },
                    { email: { [Op.substring]: search } }
                ]
            })
        }
        // Filter by courseID
        const userIdArray = [];
        if (courseId) {
            const association = await User_Course.findAll({
                where: {
                    courseId: courseId
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });
            for (let i = 0; i < association.length; i++) {
                userIdArray.push(association[i].userId);
            }
            condition.push({ id: userIdArray });
        }
        // Count All User
        const totalUser = await User.count({
            where: {
                [Op.and]: condition
            }
        });
        const user = await User.findAll({
            where: {
                [Op.and]: condition
            },
            limit: recordLimit,
            offset: offSet,
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.status(200).send({
            success: true,
            message: `Users fetched successfully!`,
            totalPage: Math.ceil(totalUser / recordLimit),
            currentPage: currentPage,
            data: user
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.findUserForAdmin = async (req, res) => {
    try {
        const { page, limit, search, courseId } = req.query;
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
        if (search) {
            condition.push({
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { mobileNumber: { [Op.substring]: search } },
                    { email: { [Op.substring]: search } }
                ]
            })
        }
        // Only that user who purchase admin course
        const userIdArray = [];
        let courseCondition;
        // Filter by courseID
        if (courseId) {
            courseCondition = {
                id: courseId,
                adminId: req.admin.id
            }
        } else {
            courseCondition = {
                adminId: req.admin.id
            }
        }
        const allAdminCourse = await Course.findAll({
            where: courseCondition,
            order: [
                ['createdAt', 'DESC']
            ]
        });
        const courseIdArray = [];
        for (let i = 0; i < allAdminCourse.length; i++) {
            courseIdArray.push(allAdminCourse[i].id);
        }
        if (courseIdArray.length > 0) {
            const association = await User_Course.findAll({
                where: {
                    courseId: courseIdArray
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });
            for (let i = 0; i < association.length; i++) {
                userIdArray.push(association[i].userId);
            }
            condition.push({ id: userIdArray });
        } else {
            condition.push({ id: userIdArray });
        }
        // Count All User
        const totalUser = await User.count({
            where: {
                [Op.and]: condition
            }
        });
        const user = await User.findAll({
            where: {
                [Op.and]: condition
            },
            limit: recordLimit,
            offset: offSet,
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.status(200).send({
            success: true,
            message: `Users fetched successfully!`,
            totalPage: Math.ceil(totalUser / recordLimit),
            currentPage: currentPage,
            data: user
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};