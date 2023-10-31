const db = require('../../Models');
const User = db.user;
const User_Course = db.user_course;
const Course = db.course;
const { userRegistration, userLogin, changePassword } = require("../../Middlewares/Validate/validateUser");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        console.log(err);
        res.status(500).send(err);
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
        console.log(err);
        res.status(500).send(err);
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
        console.log(err);
        res.status(500).send(err);
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
        console.log(err);
        res.status(500).send(err);
    }
};

// exports.findAllUserForOnlyBulkCheck = async (req, res) => {
//     try {
//         const users = await User.findAll({
//             include: [{
//                 model: User_Course,
//                 as: "user_courses"
//             }]
//         });
//         let OneCount = 0;
//         let TwoCount = 0;
//         let ThreeCount = 0;
//         let FourCount = 0;
//         let FiveCount = 0;
//         let SixCount = 0;
//         let SevenCount = 0;
//         let EightCount = 0;
//         for (let i = 0; i < users.length; i++) {
//             const course = users[i].user_courses;
//             // console.log(course);
//             if (course.length === 1) {
//                 OneCount = OneCount + 1;
//             } else if (course.length === 2) {
//                 TwoCount = TwoCount + 1;
//             } else if (course.length === 3) {
//                 ThreeCount = ThreeCount + 1;
//             } else if (course.length === 4) {
//                 FourCount = FourCount + 1;
//             } else if (course.length === 5) {
//                 FiveCount = FiveCount + 1;
//             } else if (course.length === 6) {
//                 SixCount = SixCount + 1;
//             } else if (course.length === 7) {
//                 SevenCount = SevenCount + 1;
//             } else if (course.length === 8) {
//                 EightCount = EightCount + 1;
//             }
//         }

//         const data = `${OneCount} One, ${TwoCount} Two, ${ThreeCount} Three, ${FourCount} Four, ${FiveCount} Five, ${SixCount} Six, ${SevenCount} Seven, ${EightCount} Eight`;
//         res.status(200).send({
//             success: true,
//             message: `All User fetched successfully!`,
//             data: data
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send(err);
//     }
// };

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
//         console.log(err);
//         res.status(500).send(err);
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
//         console.log(err);
//         res.status(500).send(err);
//     }
// };
