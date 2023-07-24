const express = require("express");
const auth = express.Router();
const { body } = require('express-validator');

const { registerAdmin, loginAdmin } = require("../../Controllers/Admin/authAdminController");

auth.post("/register", [
    body('email', 'Enter a valid Email').isEmail().exists(),
    body('password', 'Passward should have atleast six characters!').isLength({ min: 6 }).exists()
], registerAdmin);
auth.post("/login", [
    body('email', 'Enter a valid Email').isEmail().exists(),
    body('password', 'Passward should have atleast six characters!').isLength({ min: 6 }).exists()
], loginAdmin);

module.exports = auth;