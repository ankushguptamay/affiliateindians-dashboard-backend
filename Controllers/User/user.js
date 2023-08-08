const db = require('../../Models');
const User = db.user;
const { validationResult } = require('express-validator');
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
        const user = await User.findOne({ where: { email: req.body.email } });
        if (user) {
            return res.status(400).send({
                success: false,
                message: "User is present! Login.."
            });
        }
        const salt = await bcrypt.genSalt(10);
        const bcPassword = await bcrypt.hash(req.body.password, salt);
        await User.create({
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
        res.status(201).send({
            success: true,
            message: `User added successfully!`
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(402).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const isUser = await User.findOne({ where: { email: email } });
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
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY);
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(402).json({ errors: errors.array() });
    }
    try {
        const { email, previousPassword, newPassword } = req.body;
        const isUser = await User.findOne({ where: { email: email } });
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
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY);
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
        const user = await User.findOne({ where: { id: req.user.id } });
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

exports.findAllUser = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).send({
            success: true,
            message: `All User fetched successfully!`,
            data: users
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const users = await User.findOne({ where: { id: id } });
        if (!users) {
            return res.status(400).send({
                success: false,
                message: "User is not present"
            })
        }
        users.destroy();
        res.status(200).send({
            success: true,
            message: `User deleted successfully!`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const users = await User.findOne({ where: { id: id } });
        if (!users) {
            return res.status(400).send({
                success: false,
                message: "User is not present"
            })
        }
        users.update({
            name: req.body.name,
            // email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            address: req.body.address,
            // city: req.body.city,
            // state: req.body.state,
            // country: req.body.country,
            pinCode: req.body.pinCode
        });
        res.status(200).send({
            success: true,
            message: `User updated successfully!`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
