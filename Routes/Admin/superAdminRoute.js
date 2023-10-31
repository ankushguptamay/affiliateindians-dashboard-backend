const express = require("express");
const router = express.Router();

const { registerAdmin, loginAdmin } = require('../../Controllers/Admin/authSuperAdminController');

// Course
const { createSection, getAllSectionByCourseIdForAdmin, publicSection } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { createLesson, getLessonByLessonIdForAdmin, publicLesson } = require('../../Controllers/Admin/AddCourse/lessonController');
const { createCourse, getCourseForAdmin, getAllCourse, addOrUpdateAuthorImage, addOrUpdateCourseImage,
    deleteAuthorImage, deleteCourseImage, publicCourse, } = require('../../Controllers/Admin/AddCourse/courseController');
const { uploadLessonVideo, hardDeleteLessonVideo, getAllVideoByLessonId, addOrUpdateThumbNail } = require('../../Controllers/Admin/AddCourse/lessonVideosController');
const { createLessonQuiz, getAllQuizByLessonId, hardDeleteLessonQuiz, updateLessonQuiz } = require('../../Controllers/Admin/AddCourse/lessonQuizController');
const { addBanner, updateBanner, addPDF, hardDeletePDF, addResource, hardDeleteResource } = require('../../Controllers/Admin/AddCourse/lessonFileController');
const { addCommentForAdmin, approveComment, hardDeleteCommentForAdmin, getCommentForAdmin } = require('../../Controllers/Admin/AddCourse/videoCommentController');

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
// Files
router.post("/addBanner/:lessonId", verifyAdminToken, isSuperAdmin, uploadImage.single("lessonBanner"), addBanner);
router.post("/addPDF/:lessonId", verifyAdminToken, isSuperAdmin, uploadPDF.array("lessonPDF", 10), addPDF);
router.post("/addResource/:lessonId", verifyAdminToken, isSuperAdmin, uploadImageAndPDF.array("lessonResource", 10), addResource);
router.delete("/hardDeletePDF/:id", verifyAdminToken, isSuperAdmin, hardDeletePDF);
router.put("/updateBanner/:id", verifyAdminToken, isSuperAdmin, uploadImage.single("lessonBanner"), updateBanner);
router.delete("/hardDeleteResource/:id", verifyAdminToken, isSuperAdmin, hardDeleteResource);
// Quiz
router.post("/createQuiz/:lessonId", verifyAdminToken, isSuperAdmin, createLessonQuiz);
router.get("/quizs/:lessonId", verifyAdminToken, isSuperAdmin, getAllQuizByLessonId);
router.put("/updateQuiz/:id", verifyAdminToken, isSuperAdmin, updateLessonQuiz);
router.delete("/hardDeleteQuiz/:id", verifyAdminToken, isSuperAdmin, hardDeleteLessonQuiz);
// Video
router.post("/uploadVideo/:lessonId", verifyAdminToken, isSuperAdmin, upload.single("lessonVideo"), uploadLessonVideo);
router.put("/addOrUpdateThumbNail/:id", verifyAdminToken, isSuperAdmin, uploadImage.single("thumbnail"), addOrUpdateThumbNail);
router.get("/videos/:lessonId", verifyAdminToken, isSuperAdmin, getAllVideoByLessonId);
router.delete("/hardDeleteVideo/:id", verifyAdminToken, isSuperAdmin, hardDeleteLessonVideo);
// Comment
router.post("/addComment/:lessonVideoId", verifyAdminToken, isSuperAdmin, uploadImageAndPDF.array("commentFile", 10), addCommentForAdmin);
router.get("/comment/:lessonVideoId", verifyAdminToken, isSuperAdmin, getCommentForAdmin);
router.delete("/hardDeleteComment/:id", verifyAdminToken, isSuperAdmin, hardDeleteCommentForAdmin);
router.put("/approveComment/:id", verifyAdminToken, isSuperAdmin, approveComment);

module.exports = router;