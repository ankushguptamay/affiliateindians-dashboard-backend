const express = require("express");
const router = express.Router();

const { registerAdmin, loginAdmin } = require('../../Controllers/Admin/authAdminController');

// Master
const { getTemplate } = require('../../Controllers/Admin/Master/templateController');

// Course
const { createSection, getAllSectionByCourseIdForAdmin, publicSection } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { createLesson, getLessonByLessonIdForAdmin, publicLesson } = require('../../Controllers/Admin/AddCourse/lessonController');
const { createCourse, getCourseForAdmin, addOrUpdateAuthorImage, addOrUpdateCourseImage,
    deleteAuthorImage, deleteCourseImage, publicCourse } = require('../../Controllers/Admin/AddCourse/courseController');
const { uploadLessonVideo, deleteLessonVideo, getAllVideoByLessonId, addOrUpdateThumbNail, purgeURL } = require('../../Controllers/Admin/AddCourse/lessonVideosController');
const { createLessonQuiz, getAllQuizByLessonId, deleteLessonQuiz, updateLessonQuiz } = require('../../Controllers/Admin/AddCourse/lessonQuizController');
const { addBanner, updateBanner, addPDF, deletePDF, addResource, deleteResource } = require('../../Controllers/Admin/AddCourse/lessonFileController');
const { addCommentForAdmin, approveComment, deleteCommentForAdmin, getCommentForAdmin } = require('../../Controllers/Admin/AddCourse/videoCommentController');
// Teacher
const { registerTeacher } = require("../../Controllers/Admin/Teacher/teacherController");

//middleware
const multer = require('multer');
const upload = multer();
const { verifyAdminToken } = require('../../Middlewares/varifyToken');
const { isAdmin } = require('../../Middlewares/isPresent');
const uploadImage = require('../../Middlewares/UploadFile/uploadImages');
const uploadPDF = require('../../Middlewares/UploadFile/uploadPDF');
const uploadImageAndPDF = require('../../Middlewares/UploadFile/uploadImageAndPDF');


// Admin
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Master
router.get("/templates", verifyAdminToken, isAdmin, getTemplate);

// Teacher
// router.post("/registerTeacher", verifyAdminToken, isAdmin, registerTeacher);

// Course
router.post("/createCourse", verifyAdminToken, isAdmin, createCourse);
router.get("/myCourses", verifyAdminToken, isAdmin, getCourseForAdmin);
router.put("/addOrUpdateAuthorImage/:id", verifyAdminToken, isAdmin, uploadImage.single("authorImage"), addOrUpdateAuthorImage);
router.put("/addOrUpdateCourseImage/:id", verifyAdminToken, isAdmin, uploadImage.single("courseImage"), addOrUpdateCourseImage);
router.put("/publicCourse/:id", verifyAdminToken, isAdmin, publicCourse);
router.delete("/deleteAuthorImage/:id", verifyAdminToken, isAdmin, deleteAuthorImage);
router.delete("/deleteCourseImage/:id", verifyAdminToken, isAdmin, deleteCourseImage);
// Section
router.post("/createSection", verifyAdminToken, isAdmin, createSection);
router.get("/sections/:courseId", verifyAdminToken, isAdmin, getAllSectionByCourseIdForAdmin);
router.put("/publicSection/:id", verifyAdminToken, isAdmin, publicSection);
// Lesson
router.post("/createLesson", verifyAdminToken, isAdmin, createLesson);
router.get("/lesson/:id", verifyAdminToken, isAdmin, getLessonByLessonIdForAdmin);
router.put("/publicLesson/:id", verifyAdminToken, isAdmin, publicLesson);
// Video
router.post("/uploadVideo/:lessonId", verifyAdminToken, isAdmin, upload.single("lessonVideo"), uploadLessonVideo);
router.put("/addOrUpdateThumbNail/:id", verifyAdminToken, isAdmin, uploadImage.single("thumbnail"), addOrUpdateThumbNail);
router.get("/videos/:lessonId", verifyAdminToken, isAdmin, getAllVideoByLessonId);
router.delete("/deleteVideo/:id", verifyAdminToken, isAdmin, deleteLessonVideo);
// Quiz
router.post("/createQuiz/:lessonId", verifyAdminToken, isAdmin, createLessonQuiz);
router.get("/quizs/:lessonId", verifyAdminToken, isAdmin, getAllQuizByLessonId);
router.put("/updateQuiz/:id", verifyAdminToken, isAdmin, updateLessonQuiz);
router.delete("/deleteQuiz/:id", verifyAdminToken, isAdmin, deleteLessonQuiz);
// Files
router.post("/addBanner/:lessonId", verifyAdminToken, isAdmin, uploadImage.single("lessonBanner"), addBanner);
router.post("/addPDF/:lessonId", verifyAdminToken, isAdmin, uploadPDF.array("lessonPDF", 10), addPDF);
router.post("/addResource/:lessonId", verifyAdminToken, isAdmin, uploadImageAndPDF.array("lessonResource", 10), addResource);
router.delete("/deletePDF/:id", verifyAdminToken, isAdmin, deletePDF);
router.put("/updateBanner/:id", verifyAdminToken, isAdmin, uploadImage.single("lessonBanner"), updateBanner);
router.delete("/deleteResource/:id", verifyAdminToken, isAdmin, deleteResource);
// Comment
router.post("/addComment/:lessonVideoId", verifyAdminToken, isAdmin, uploadImageAndPDF.array("commentFile", 10), addCommentForAdmin);
router.get("/comment/:lessonVideoId", verifyAdminToken, isAdmin, getCommentForAdmin);
router.delete("/deleteComment/:id", verifyAdminToken, isAdmin, deleteCommentForAdmin);
router.put("/approveComment/:id", verifyAdminToken, isAdmin, approveComment);

module.exports = router;