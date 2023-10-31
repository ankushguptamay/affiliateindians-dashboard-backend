const express = require("express");
const router = express.Router();

const { create, changePassword, login, findUser } = require("../../Controllers/User/user");
const { getAllCourse, getUsersCourse } = require('../../Controllers/Admin/AddCourse/courseController');
const { getAllSectionByCourseIdForUser } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { getLessonByLessonIdForUser } = require('../../Controllers/Admin/AddCourse/lessonController');
const { getAllQuizByLessonId } = require('../../Controllers/Admin/AddCourse/lessonQuizController');

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
router.get("/myCourses", verifyUserToken, isUser, getUsersCourse);
router.get("/sections/:courseId", verifyUserToken, isUser, getAllSectionByCourseIdForUser);
router.get("/lesson/:id", verifyUserToken, isUser, getLessonByLessonIdForUser);
router.get("/quizs/:lessonId", verifyUserToken, isUser, getAllQuizByLessonId);

module.exports = router;