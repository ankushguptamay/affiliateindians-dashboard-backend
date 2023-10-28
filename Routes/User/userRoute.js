const express = require("express");
const router = express.Router();
const { body } = require('express-validator');

const { create, changePassword, login, findUser } = require("../../Controllers/User/user");

// Middleware
const { verifyUserToken } = require('../../Middlewares/varifyToken');
const { isUser } = require('../../Middlewares/isPresent');

// Admin
router.post("/register", create);
router.post("/login", login);
router.post("/changePassword", verifyUserToken, isUser, changePassword);
router.get("/users", verifyUserToken, isUser, findUser);

module.exports = router;