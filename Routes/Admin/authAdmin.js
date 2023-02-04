const { body } = require('express-validator');
const express = require("express");
const router = express.Router();

const {
    registerAdmin,
    loginAdmin
} = require("../../Controllers/Admin/authAdmin.controller");

router.post("/register", [
    body('email', 'Enter a valid Email').isEmail().exists(),
    body('password', 'Passward should have atleast six characters!').isLength({ min: 6 }).exists()
], registerAdmin);
router.post("/login", [
    body('email', 'Enter a valid Email').isEmail().exists(),
    body('password', 'Passward should have atleast six characters!').isLength({ min: 6 }).exists()
], loginAdmin);

module.exports = router;