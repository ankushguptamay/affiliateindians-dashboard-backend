const db = require('../../Models');
const Admin = db.admin;
const { suparAdminRegistration, superAdminLogin } = require("../../Middlewares/Validate/validateSuperAdmin");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
//         const salt = await bcrypt.genSalt(10);
//         const bcPassword = await bcrypt.hash(password, salt);

//         await Admin.create({
//             name: name,
//             email: email,
//             password: bcPassword,
//             adminTag: 'SUPERADMIN'
//         });
//         res.status(201).send({
//             success: true,
//             message: "Admin registered successfully"
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
        const { email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).send({
                success: false,
                message: "Password should be match!"
            });
        }
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
        res.status(500).send({ message: err.message });
    }
};