const db = require('../../Models');
const User = db.user;
const User_Course = db.user_course;
const UserEmailOTP = db.userEmailOTP;
const EmailCredential = db.emailCredential
const Course = db.course;
const UserWallet = db.userWallet;
const { userRegistration, userLogin, changePassword, sendOTP, verifyOTP, generatePassword } = require("../../Middlewares/Validate/validateUser");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { OTP_VALIDITY_IN_MILLISECONDS, OTP_DIGITS_LENGTH } = process.env;

const FORGET_OTP_VALIDITY = (OTP_VALIDITY_IN_MILLISECONDS) ? OTP_VALIDITY_IN_MILLISECONDS : '600000';
const OTP_LENGTH = (OTP_DIGITS_LENGTH) ? OTP_DIGITS_LENGTH : 6;

// Sending Email
const emailOTP = require('../../Util/generateOTP');
const brevo = require('@getbrevo/brevo');

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
            },
            paranoid: false
        });
        if (isUser) {
            if (isUser.deletedAt !== null) {
                return res.status(400).send({
                    success: false,
                    message: "You are blocked by Affiliate Indian!"
                });
            } else {
                return res.status(400).send({
                    success: false,
                    message: "User is present! Login.."
                });
            }
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
        const isUserCode = await User.findAll({
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
        if (isUserCode.length == 0) {
            code = "AFUS" + day + month + year + Day[dayNumber] + 1;
        } else {
            let lastCode = isUserCode[isUserCode.length - 1];
            let lastDigits = lastCode.userCode.substring(13);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "AFUS" + day + month + year + Day[dayNumber] + incrementedDigits;
        }
        const salt = await bcrypt.genSalt(10);
        const bcPassword = await bcrypt.hash(req.body.password, salt);
        // Store in database
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            pinCode: req.body.pinCode,
            password: bcPassword,
            userCode: code,
            termAndConditionAccepted: req.body.termAndConditionAccepted
        });
        // Creating Wallet
        await UserWallet.create({
            userId: user.id
        });
        const data = {
            id: user.id,
            email: user.email
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY_USER);
        res.status(201).send({
            success: true,
            message: `User added successfully!`,
            authToken: authToken
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
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
            },
            paranoid: false
        });
        if (!isUser) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! try to login with currect credentials.'
            });
        }
        if (isUser.deletedAt !== null) {
            return res.status(400).send({
                success: false,
                message: "You are blocked by Affiliate Indian!"
            });
        }
        const compairPassword = await bcrypt.compare(password, isUser.password);
        if (!compairPassword) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! try to login with currect credentials.'
            });
        }
        if (isUser.termAndConditionAccepted !== true) {
            return res.status(400).send({
                success: false,
                message: 'Please Accept terms and conditions!.'
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
        res.status(500).send({
            success: false,
            err: err.message
        });
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
        res.status(500).send({
            success: false,
            err: err.message
        });
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
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.softDeleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const users = await User.findOne({ where: { id: id } });
        if (!users) {
            return res.status(400).send({
                success: false,
                message: "User is not present"
            })
        }
        await users.destroy();
        res.status(200).send({
            success: true,
            message: `User blocked successfully!`
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.restoreUser = async (req, res) => {
    try {
        const id = req.params.id;
        const users = await User.findOne({
            where: {
                id: id,
                deletedAt: { [Op.ne]: null }
            }, paranoid: false
        });
        if (!users) {
            return res.status(400).send({
                success: false,
                message: "This user is not in block list!"
            })
        }
        await users.restore();
        res.status(200).send({
            success: true,
            message: `User unblocked successfully!`
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.user.id;
        const email = req.user.email;
        const users = await User.findOne({
            where: {
                id: id,
                email: email
            }
        });
        const { city, state, country, pinCode, address, mobileNumber, name } = req.body;
        await users.update({
            ...users,
            name: name,
            mobileNumber: mobileNumber,
            address: address,
            city: city,
            state: state,
            country: country,
            pinCode: pinCode
        });
        res.status(200).send({
            success: true,
            message: `User,s data updated successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

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
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.findUnBlockUserForAdmin = async (req, res) => {
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
        let courseName = "In All Courses";
        if (courseId) {
            courseName = allAdminCourse[0].title
        }
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
        //get only blocked User
        const countCondition = {
            where: {
                [Op.and]: condition
            }
        };
        const getCondition = {
            where: {
                [Op.and]: condition
            },
            limit: recordLimit,
            offset: offSet,
            order: [
                ['createdAt', 'DESC']
            ]
        };
        // Count All User
        const totalUser = await User.count(countCondition);
        // Get user
        const user = await User.findAll(getCondition);
        res.status(200).send({
            success: true,
            message: `Users fetched successfully!`,
            totalPage: Math.ceil(totalUser / recordLimit),
            currentPage: currentPage,
            data: user,
            courseName: courseName
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.findBlockUserForAdmin = async (req, res) => {
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
        const condition = [{ deletedAt: { [Op.ne]: null } }];
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
        let courseName = "In All Courses";
        if (courseId) {
            courseName = allAdminCourse[0].title
        }
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
        //get only blocked User
        const countCondition = {
            where: {
                [Op.and]: condition
            },
            paranoid: false
        };
        const getCondition = {
            where: {
                [Op.and]: condition
            },
            limit: recordLimit,
            offset: offSet,
            paranoid: false,
            order: [
                ['createdAt', 'DESC']
            ]
        };
        // Count All User
        const totalUser = await User.count(countCondition);
        // Get user
        const user = await User.findAll(getCondition);
        res.status(200).send({
            success: true,
            message: `Users fetched successfully!`,
            totalPage: Math.ceil(totalUser / recordLimit),
            currentPage: currentPage,
            data: user,
            courseName: courseName
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getAllUserWallet = async (req, res) => {
    try {
        const wallet = await UserWallet.findAll();
        res.status(201).send({
            success: true,
            message: `Wallet fetched successfully!`,
            data: wallet
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.sendOTPForForgetPassword = async (req, res) => {
    try {
        // Validate body
        const { error } = sendOTP(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { email } = req.body;
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
        // Generate OTP for Email
        const otp = emailOTP.generateFixedLengthRandomNumber(OTP_LENGTH);
        // Update sendEmail 0 every day
        const date = JSON.stringify(new Date());
        const todayDate = `${date.slice(1, 11)}`;
        const changeUpdateDate = await EmailCredential.findAll({
            where: {
                updatedAt: { [Op.lt]: todayDate }
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        for (let i = 0; i < changeUpdateDate.length; i++) {
            console.log("hii");
            await EmailCredential.update({
                emailSend: 0
            }, {
                where: {
                    id: changeUpdateDate[i].id
                }
            });
        }
        // finalise email credentiel
        const emailCredential = await EmailCredential.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        });
        let finaliseEmailCredential;
        for (let i = 0; i < emailCredential.length; i++) {
            if (parseInt(emailCredential[i].emailSend) < 300) {
                finaliseEmailCredential = emailCredential[i];
                break;
            }
        }
        if (emailCredential.length <= 0) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! Some server error!'
            });
        }
        if (!finaliseEmailCredential) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! Some server error!'
            });
        }
        // Send OTP to Email By Brevo
        if (finaliseEmailCredential.plateForm === "BREVO") {
            let defaultClient = brevo.ApiClient.instance;
            let apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = finaliseEmailCredential.EMAIL_API_KEY;
            let apiInstance = new brevo.TransactionalEmailsApi();
            let sendSmtpEmail = new brevo.SendSmtpEmail();
            sendSmtpEmail.subject = "AFFILIATE INDIAN";
            sendSmtpEmail.sender = { "name": "Affiliate Indian", "email": finaliseEmailCredential.email };
            sendSmtpEmail.replyTo = { "email": finaliseEmailCredential.email, "name": "Affiliate Indian" };
            sendSmtpEmail.headers = { "OTP for regenerate password": isUser.userCode };
            sendSmtpEmail.htmlContent = `OTP ${otp} Expires in ${parseInt(FORGET_OTP_VALIDITY) / 1000 / 60} minutes!`;
            sendSmtpEmail.to = [
                { "email": email, "name": isUser.name }
            ];
            apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
                // console.log('API called successfully. Returned data: ' + JSON.stringify(data));
            }, function (error) {
                console.error(error);
            });
            const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
            await EmailCredential.update({
                emailSend: increaseNumber
            }, { where: { id: finaliseEmailCredential.id } });
        } else {
            return res.status(400).send({
                success: false,
                message: 'Sorry! Some server error!'
            });
        }
        //  Store OTP
        await UserEmailOTP.create({
            vallidTill: new Date().getTime() + parseInt(FORGET_OTP_VALIDITY),
            otp: otp,
            userId: isUser.id
        });
        res.status(201).send({
            success: true,
            message: `OTP send to email successfully! Valid for ${FORGET_OTP_VALIDITY / (60 * 1000)} minutes!`,
            data: { email: email }
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        // Validate body
        const { error } = verifyOTP(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { email, otp } = req.body;
        // Is Email Otp exist
        const isOtp = await UserEmailOTP.findOne({
            where: {
                otp: otp
            }
        });
        if (!isOtp) {
            return res.status(400).send({
                success: false,
                message: `Invalid OTP!`
            });
        }
        // Checking is user present or not
        const user = await User.findOne({
            where: {
                [Op.and]: [
                    { email: email }, { id: isOtp.userId }
                ]
            }
        });
        if (!user) {
            return res.status(400).send({
                success: false,
                message: "No Details Found. Register Now!"
            });
        }
        // is email otp expired?
        const isOtpExpired = new Date().getTime() > parseInt(isOtp.vallidTill);
        if (isOtpExpired) {
            await UserEmailOTP.destroy({ where: { userId: isOtp.userId } });
            return res.status(400).send({
                success: false,
                message: `OTP expired, please regenerate new OTP!`
            });
        }
        res.status(201).send({
            success: true,
            message: `OTP matched successfully!`,
            data: { email: email }
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.generatePassword = async (req, res) => {
    try {
        // Validate body
        const { error } = generatePassword(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).send({
                success: false,
                message: "Password should be match!"
            });
        }
        // Checking is user present or not
        const user = await User.findOne({
            where: {
                email: email
            }
        });
        if (!user) {
            return res.status(400).send({
                success: false,
                message: "No Details Found. Register Now!"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const bcPassword = await bcrypt.hash(password, salt);
        // Update User
        await user.update({
            ...user,
            password: bcPassword
        });
        // Generate Authtoken
        const data = {
            id: user.id,
            email: user.email
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY_USER);
        res.status(201).send({
            success: true,
            message: `Password generated successfully!`,
            authToken: authToken
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.addUserToCourse = async (req, res) => {
    try {
        const { email, name, courseId } = req.body;

        const adminId = req.admin.id;
        const condition = [{ id: courseId }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const findCourse = await Course.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!findCourse) {
            return res.status(400).send({
                success: false,
                message: `This course is not present in your courses!`
            });
        }
        // find User
        let user = await User.findOne({
            where: {
                email: email
            },
            paranoid: false
        });
        if (!user) {
            // Generating Code
            // 1.Today Date
            const date = JSON.stringify(new Date((new Date).getTime() - (24 * 60 * 60 * 1000)));
            const today = `${date.slice(1, 12)}18:30:00.000Z`;
            // 2.Today Day
            const Day = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const dayNumber = (new Date).getDay();
            // Get All Today Code
            let code;
            const isUserCode = await User.findAll({
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
            if (isUserCode.length === 0) {
                code = "AFUS" + day + month + year + Day[dayNumber] + 1;
            } else {
                let lastCode = isUserCode[isUserCode.length - 1];
                let lastDigits = lastCode.userCode.substring(13);
                let incrementedDigits = parseInt(lastDigits, 10) + 1;
                code = "AFUS" + day + month + year + Day[dayNumber] + incrementedDigits;
            }
            const salt = await bcrypt.genSalt(10);
            const bcPassword = await bcrypt.hash(`${(email).slice(0, 8)}`, salt);
            user = await User.create({
                name: name,
                email: email,
                password: bcPassword,
                userCode: code,
                termAndConditionAccepted: true
            });
            // create wallet
            await UserWallet.create({
                userId: user.id
            });
        }
        if (user.deletedAt) {
            return res.status(400).send({
                success: false,
                message: `This User ${user.name} blocked by admin! First Unblocked this user!`
            });
        }
        const isUserCourse = await User_Course.findOne({ where: { courseId: courseId, userId: user.id, verify: true, status: "paid" } });
        if (isUserCourse) {
            return res.status(400).send({
                success: false,
                message: `${user.name} already has ${findCourse.title} Course!`
            });
        }
        await User_Course.create({ courseId: courseId, userId: user.id, verify: true, status: "paid" });
        res.status(201).send({
            success: true,
            message: `${findCourse.title} assign to ${user.name} successfully!`
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};