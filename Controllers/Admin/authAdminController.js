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
            adminTag: admin.adminTag
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