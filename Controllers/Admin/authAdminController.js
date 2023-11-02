const db = require('../../Models');
const Admin = db.admin;
const { adminLogin, adminRegistration } = require("../../Middlewares/Validate/validateAdmin");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//register Admin
exports.registerAdmin = async (req, res) => {
    // Validate body
    const { error } = adminRegistration(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    try {
        const { email, password, name, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).send({
                success: false,
                message: "Password should be match!"
            });
        }
        const isAdmin = await Admin.findOne({ where: { email: email } });
        if (isAdmin) {
            return res.status(400).send({
                success: false,
                message: "Admin already registered"
            });
        }
        // Generating Code
        let code;
        const isAdminCode = await Admin.findAll({
            order: [
                ['createdAt', 'ASC']
            ],
            paranoid: false
        });
        if (isAdminCode.length == 0) {
            const year = new Date().toISOString().slice(2, 4);
            const month = new Date().toISOString().slice(5, 7);
            code = "AFF" + year + month + 1000;
        } else {
            const year = new Date().toISOString().slice(2, 4);
            const month = new Date().toISOString().slice(5, 7);
            let lastCode = isAdminCode[isAdminCode.length - 1];
            let lastDigits = lastCode.adminCode.substring(7);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "AFF" + year + month + incrementedDigits;
        }
        const salt = await bcrypt.genSalt(10);
        const bcPassword = await bcrypt.hash(password, salt);

        const admin = await Admin.create({
            name: name,
            email: email,
            password: bcPassword
        });
        const data = {
            id: admin.id,
            email: admin.email,
            adminTag: admin.adminTag,
            adminCode: code
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY_ADMIN);
        res.status(201).send({
            success: true,
            message: "Admin registered successfully",
            authToken: authToken
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
};

//Login Admin
exports.loginAdmin = async (req, res) => {
    // Validate body
    const { error } = adminLogin(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    try {
        const { email, password } = req.body;
        const isAdmin = await Admin.findOne({ where: { email: email } });
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