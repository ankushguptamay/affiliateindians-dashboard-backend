const db = require('../../Models');
const Admin = db.admin;
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//register Admin
exports.registerAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(402).json({ errors: errors.array() });
    }
    try {
        const { email, password} = req.body;
        const isAdmin = await Admin.findOne({ where: { email: email } });
        if (isAdmin) {
            return res.status(400).send({ message: "Admin already registered"});
        }
        const salt = await bcrypt.genSalt(10);
        const bcPassword = await bcrypt.hash(password, salt);

        await Admin.create({
            email: email,
            password: bcPassword
        });
        res.status(201).send({
            message: "Admin registered successfully"
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
};

//Login Admin
exports.loginAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(402).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const isAdmin = await Admin.findOne({ where: { email: email } });
        if (!isAdmin) {
            return res.status(400).send({message:'Sorry! try to login with currect credentials.'});
        }
        const compairPassword = await bcrypt.compare(password, isAdmin.password);
        if (!compairPassword) {
            return res.status(400).send({message:'Sorry! try to login with currect credentials.'});
        }
        const data = {
            id: isAdmin.id,
            email: isAdmin.email
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY);
        res.status(201).send({
            message: "Admin LogedIn successfully",
            authToken: authToken
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
};