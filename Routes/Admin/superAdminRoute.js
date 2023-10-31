const express = require("express");
const router = express.Router();

const { registerAdmin, loginAdmin } = require('../../Controllers/Admin/authSuperAdminController');

// Course
const { createSection, getAllSectionByCourseIdForAdmin, updateSection, publicSection, deleteSection } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { createLesson, getLessonByLessonIdForAdmin, publicLesson, updateLesson, deleteLesson } = require('../../Controllers/Admin/AddCourse/lessonController');
const { createCourse, getCourseForAdmin, updateCourse, addOrUpdateAuthorImage, addOrUpdateCourseImage,
    deleteAuthorImage, deleteCourseImage, publicCourse, deleteCourse } = require('../../Controllers/Admin/AddCourse/courseController');
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


module.exports = router;