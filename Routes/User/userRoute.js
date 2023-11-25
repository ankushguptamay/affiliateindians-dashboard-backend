const express = require("express");
const router = express.Router();

const { create, changePassword, login, findUser, update } = require("../../Controllers/User/user");
const { addAccountDetails, findUserAccountDetails, deleteAccountDetails, updateAccountDetails } = require("../../Controllers/User/userAccountDetailsCont");
const { submitAnswer, checkResultForUser } = require("../../Controllers/User/quizAnswerController");
const { getCoupon, applyCouponToCourse } = require('../../Controllers/Admin/Master/couponController');
const { getAllCourse, getUsersCourse } = require('../../Controllers/Admin/AddCourse/courseController');
const { getAllSectionByCourseIdForUser } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { getLessonByLessonIdForUser } = require('../../Controllers/Admin/AddCourse/lessonController');
const { getAllQuizByLessonId } = require('../../Controllers/Admin/AddCourse/lessonQuizController');
const { getAllVideoByLessonId } = require('../../Controllers/Admin/AddCourse/lessonVideosController');
const { addCommentForUser, hardDeleteCommentForUser, getCommentForUser } = require('../../Controllers/Admin/AddCourse/videoCommentController');
const { createPayment, verifyPayment } = require('../../Controllers/User/purchaseCourseController');
const { submitAssignmentAnswer, getAssignmentAnswerByLessonIdForUser } = require('../../Controllers/Admin/AddCourse/assignmentController');
// Middleware
const { verifyUserToken, verifyUserTokenForPayment } = require('../../Middlewares/varifyToken');
const { isUser, isUserForPayment } = require('../../Middlewares/isPresent');
const uploadImageAndPDF = require('../../Middlewares/UploadFile/uploadImageAndPDF');

// User
router.post("/register", create);
router.post("/login", login);
router.post("/changePassword", verifyUserToken, isUser, changePassword);
router.get("/users", verifyUserToken, isUser, findUser);
router.put("/update", verifyUserToken, isUser, update);

// Course
router.get("/courses", verifyUserToken, isUser, getAllCourse);
router.get("/myCourses", verifyUserToken, isUser, getUsersCourse);
router.get("/sections/:courseId", verifyUserToken, isUser, getAllSectionByCourseIdForUser);
router.get("/lesson/:id", verifyUserToken, isUser, getLessonByLessonIdForUser);
router.get("/quizs/:lessonId", verifyUserToken, isUser, getAllQuizByLessonId);
router.get("/videos/:lessonId", verifyUserToken, isUser, getAllVideoByLessonId);

// Comment
router.post("/addComment/:lessonVideoId", verifyUserToken, isUser, uploadImageAndPDF.array("commentFile", 10), addCommentForUser);
router.get("/comment/:lessonVideoId", verifyUserToken, isUser, getCommentForUser);
router.delete("/hardDeleteComment/:id", verifyUserToken, isUser, hardDeleteCommentForUser);

// Purchase
router.post("/createPayment/:id", verifyUserTokenForPayment, isUserForPayment, createPayment);
router.post("/verifyPayment", verifyPayment);

//Coupon
router.get("/coupons", verifyUserToken, isUser, getCoupon);
router.put("/applyCouponToCourse", verifyUserToken, isUser, applyCouponToCourse);

// Quiz Answer
router.post("/submitAnswer", verifyUserToken, isUser, submitAnswer);
router.get("/results", verifyUserToken, isUser, checkResultForUser);

// Assignment Answer
router.post("/submitAssignmentAnswer/:id", verifyUserToken, isUser, submitAssignmentAnswer); // assignmentId
router.get("/getAssignmentAnswer/:id", verifyUserToken, isUser, getAssignmentAnswerByLessonIdForUser); // lessonId

// Account Details
router.post("/addAccountDetails", verifyUserToken, isUser, addAccountDetails);
router.get("/findUserAccountDetails", verifyUserToken, isUser, findUserAccountDetails);
router.put("/updateAccountDetails/:id", verifyUserToken, isUser, updateAccountDetails);
router.delete("/deleteAccountDetails/:id", verifyUserToken, isUser, deleteAccountDetails);

module.exports = router;