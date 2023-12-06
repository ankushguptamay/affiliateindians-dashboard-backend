const db = require('../../Models');
const Admin = db.admin;
const AdminWallet = db.adminWallet;
const { suparAdminRegistration, superAdminLogin } = require("../../Middlewares/Validate/validateSuperAdmin");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

//register Super Admin
// exports.registerAdmin = async (req, res) => {
//     // Validate body
//     const { error } = suparAdminRegistration(req.body);
//     if (error) {
//         return res.status(400).send(error.details[0].message);
//     }
//     try {
//         const { email, password, name, confirmPassword } = req.body;
//         if (password !== confirmPassword) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Password should be match!"
//             });
//         }
//         const isAdmin = await Admin.findOne({ where: { email: email } });
//         if (isAdmin) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Admin already registered"
//             });
//         }
//         // Generating Code
//         // 1.Today Date
//         const date = JSON.stringify(new Date((new Date).getTime() - (24 * 60 * 60 * 1000)));
//         const today = `${date.slice(1, 12)}18:30:00.000Z`;
//         // 2.Today Day
//         const Day = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
//         const dayNumber = (new Date).getDay();
//         // Get All Today Code
//         let code;
//         const isAdminCode = await Admin.findAll({
//             where: {
//                 createdAt: { [Op.gt]: today }
//             },
//             order: [
//                 ['createdAt', 'ASC']
//             ],
//             paranoid: false
//         });
//         const day = new Date().toISOString().slice(8, 10);
//         const year = new Date().toISOString().slice(2, 4);
//         const month = new Date().toISOString().slice(5, 7);
//         if (isAdminCode.length == 0) {
//             code = "AFAD" + day + month + year + Day[dayNumber] + 1;
//         } else {
//             let lastCode = isAdminCode[isAdminCode.length - 1];
//             let lastDigits = lastCode.adminCode.substring(13);
//             let incrementedDigits = parseInt(lastDigits, 10) + 1;
//             code = "AFAD" + day + month + year + Day[dayNumber] + incrementedDigits;
//         }
//         const salt = await bcrypt.genSalt(10);
//         const bcPassword = await bcrypt.hash(password, salt);

//         const admin = await Admin.create({
//             name: name,
//             email: email,
//             password: bcPassword,
//             adminTag: 'SUPERADMIN',
//             adminCode: code
//         });
//         // Creating Wallet
//         await AdminWallet.create({
//             adminId: admin.id
//         });
//         res.status(201).send({
//             success: true,
//             message: "Admin registered successfully",
//         });
//     }
//     catch (err) {
//         res.status(500).send({ message: err.message });
//     }
// };

// Login Super Admin
exports.loginAdmin = async (req, res) => {
    // Validate body
    const { error } = superAdminLogin(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    try {
        const { email, password } = req.body;
        const isAdmin = await Admin.findOne({
            where: {
                email: email,
                adminTag: 'SUPERADMIN'
            }
        });
        if (!isAdmin) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! try to login with currect credentials.'
            });
        }
        const compairPassword = await bcrypt.compare(password, isAdmin.password);
        if (!compairPassword) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! try to login with currect credentials.'
            });
        }
        const data = {
            id: isAdmin.id,
            email: isAdmin.email,
            adminTag: isAdmin.adminTag
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY_ADMIN);
        res.status(201).send({
            success: true,
            message: "Admin LogedIn successfully",
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

exports.getAllAdminWallet = async (req, res) => {
    try {
        const wallet = await AdminWallet.findAll();
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