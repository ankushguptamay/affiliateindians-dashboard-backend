const express = require("express");
const auth = express.Router();
const { body } = require('express-validator');

const { create, changePassword, login, findUser } = require("../../Controllers/User/user");

const { verifyUserToken } = require('../../Middlewares/varifyToken');

auth.post("/register", create);
auth.post("/login", [
    body('email', 'Enter a valid Email').isEmail().exists(),
    body('password', 'Passward should have atleast six characters!').isLength({ min: 6 }).exists()
], login);
auth.post("/changePassword", [
    body('email', 'Enter a valid Email').isEmail().exists(),
    body('previousPassword', 'Passward should have atleast six characters!').isLength({ min: 6 }).exists(),
    body('newPassword', 'Passward should have atleast six characters!').isLength({ min: 6 }).exists()
], changePassword);
auth.get("/user", verifyUserToken, findUser);

module.exports = auth;