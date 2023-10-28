const db = require('../../../Models');
const Teacher = db.teacher;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//register
exports.registerTeacher = async (req, res) => {
    try {
        const { name, email, mobileNumber, password } = req.body;
        const isTeacher = await Teacher.findOne({ where: { email: email } });
        if (isTeacher) {
            return res.status(400).send({
                success: false,
                message: "Teacher is already registered"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const bcPassword = await bcrypt.hash(password, salt);

        await Teacher.create({
            name: name,
            email: email,
            mobileNumber: mobileNumber,
            password: bcPassword,
            adminId: req.admin.id
        });
        res.status(201).send({
            success: true,
            message: "Teacher registered successfully"
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
};

//Login
exports.loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;
        const isTeacher = await Teacher.findOne({ where: { email: email } });
        if (!isTeacher) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! try to login with currect credentials.'
            });
        }
        const compairPassword = await bcrypt.compare(password, isTeacher.password);
        if (!compairPassword) {
            return res.status(400).send({
                success: false,
                message: 'Sorry! try to login with currect credentials.'
            });
        }
        const data = {
            id: isTeacher.id,
            email: isTeacher.email,
            adminId: isTeacher.adminId
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY);
        res.status(201).send({
            success: true,
            message: "Teacher LogedIn successfully",
            authToken: authToken
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
};