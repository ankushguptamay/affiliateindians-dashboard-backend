const express = require("express");
const router = express.Router();

const { registerAdmin, loginAdmin } = require('../../Controllers/Admin/authSuperAdminController');

// Course
const { createSection, getAllSectionByCourseIdForAdmin, publicSection } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { createLesson, getLessonByLessonIdForAdmin, publicLesson } = require('../../Controllers/Admin/AddCourse/lessonController');
const { createCourse, getCourseForAdmin, getAllCourse, addOrUpdateAuthorImage, addOrUpdateCourseImage,
    deleteAuthorImage, deleteCourseImage, publicCourse, } = require('../../Controllers/Admin/AddCourse/courseController');
const { uploadLessonVideo, deleteLessonVideo, getAllVideoByLessonId, addOrUpdateThumbNail, purgeURL } = require('../../Controllers/Admin/AddCourse/lessonVideosController');
const { createLessonQuiz, getAllQuizByLessonId, deleteLessonQuiz, updateLessonQuiz } = require('../../Controllers/Admin/AddCourse/lessonQuizController');
const { addBanner, updateBanner, addPDF, deletePDF, addResource, deleteResource } = require('../../Controllers/Admin/AddCourse/lessonFileController');
const { addCommentForAdmin, approveComment, deleteCommentForAdmin, getCommentForAdmin } = require('../../Controllers/Admin/AddCourse/videoCommentController');

//middleware
const multer = require('multer');
const upload = multer();
const { verifyAdminToken } = require('../../Middlewares/varifyToken');
const { isSuperAdmin } = require('../../Middlewares/isPresent');
const uploadImage = require('../../Middlewares/UploadFile/uploadImages');
const uploadPDF = require('../../Middlewares/UploadFile/uploadPDF');
const uploadImageAndPDF = require('../../Middlewares/UploadFile/uploadImageAndPDF');

// Route
// Super Admin 
// router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Course
router.post("/createCourse", verifyAdminToken, isSuperAdmin, createCourse);
router.get("/myCourses", verifyAdminToken, isSuperAdmin, getCourseForAdmin);
router.get("/courses", verifyAdminToken, isSuperAdmin, getAllCourse);
router.put("/addOrUpdateAuthorImage/:id", verifyAdminToken, isSuperAdmin, uploadImage.single("authorImage"), addOrUpdateAuthorImage);
router.put("/addOrUpdateCourseImage/:id", verifyAdminToken, isSuperAdmin, uploadImage.single("courseImage"), addOrUpdateCourseImage);
router.put("/publicCourse/:id", verifyAdminToken, isSuperAdmin, publicCourse);
router.delete("/deleteAuthorImage/:id", verifyAdminToken, isSuperAdmin, deleteAuthorImage);
router.delete("/deleteCourseImage/:id", verifyAdminToken, isSuperAdmin, deleteCourseImage);
// Section
router.post("/createSection", verifyAdminToken, isSuperAdmin, createSection);
router.get("/sections/:courseId", verifyAdminToken, isSuperAdmin, getAllSectionByCourseIdForAdmin);
router.put("/publicSection/:id", verifyAdminToken, isSuperAdmin, publicSection);
// Lesson
router.post("/createLesson", verifyAdminToken, isSuperAdmin, createLesson);
router.get("/lesson/:id", verifyAdminToken, isSuperAdmin, getLessonByLessonIdForAdmin);
router.put("/publicLesson/:id", verifyAdminToken, isSuperAdmin, publicLesson);

module.exports = router;