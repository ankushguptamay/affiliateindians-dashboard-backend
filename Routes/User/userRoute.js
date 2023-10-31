const express = require("express");
const router = express.Router();

const { create, changePassword, login, findUser } = require("../../Controllers/User/user");
const { getAllCourse, getUsersCourse } = require('../../Controllers/Admin/AddCourse/courseController');
const { getAllSectionByCourseIdForUser } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { getLessonByLessonIdForUser } = require('../../Controllers/Admin/AddCourse/lessonController');

// Middleware
const { verifyUserToken } = require('../../Middlewares/varifyToken');
const { isUser } = require('../../Middlewares/isPresent');

// User
router.post("/register", create);
router.post("/login", login);
router.post("/changePassword", verifyUserToken, isUser, changePassword);
router.get("/users", verifyUserToken, isUser, findUser);

// Course
router.get("/courses", verifyUserToken, isUser, getAllCourse);
router.get("/myCourses", verifyUserToken, isUser, getAllCourse);
router.get("/sections/:courseId", verifyUserToken, isUser, getAllSectionByCourseIdForUser);
router.get("/lesson/:id", verifyUserToken, isUser, getLessonByLessonIdForUser);

module.exports = router;