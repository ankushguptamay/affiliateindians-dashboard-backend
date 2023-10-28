const express = require("express");
const auth = express.Router();
const { body } = require('express-validator');

const { create, changePassword, login, findUser } = require("../../Controllers/User/user");

// Middleware
const { verifyUserToken } = require('../../Middlewares/varifyToken');

module.exports = auth;