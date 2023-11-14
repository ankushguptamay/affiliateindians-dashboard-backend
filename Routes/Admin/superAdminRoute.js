const express = require("express");
const router = express.Router();

const { registerAdmin, loginAdmin, getAllAdminWallet } = require('../../Controllers/Admin/authSuperAdminController');

const { getAllPaymentData } = require('../../Controllers/User/purchaseCourseController');
// Master
const { getTemplate, addTemplate, hardDeleteTemplate } = require('../../Controllers/Admin/Master/templateController');
const { getTag, hardDeleteTag, addTag } = require('../../Controllers/Admin/Master/tagController');
const { getRatio, addRatio, hardDeleteRatio } = require('../../Controllers/Admin/Master/affiliateMarketingRatioController');
const { getCoupon, addCouponToCourse, createCoupon, hardDeleteCoupon, UpdateCoupon } = require('../../Controllers/Admin/Master/couponController');
// Course
const { createSection, getAllSectionByCourseIdForAdmin, publicSection, unPublicSection, updateSection } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { createLesson, getLessonByLessonIdForAdmin, publicLesson, unPublicLesson, updateLesson } = require('../../Controllers/Admin/AddCourse/lessonController');
const { createCourse, getCourseForAdmin, getAllCourse, addOrUpdateAuthorImage, addOrUpdateCourseImage, updateCourse,getCourseById,
    deleteAuthorImage, deleteCourseImage, publicCourse, unPublicCourse } = require('../../Controllers/Admin/AddCourse/courseController');
const { uploadLessonVideo, hardDeleteLessonVideo, getAllVideoByLessonId, addOrUpdateThumbNail } = require('../../Controllers/Admin/AddCourse/lessonVideosController');
const { createLessonQuiz, getAllQuizByLessonId, hardDeleteLessonQuiz, updateLessonQuiz } = require('../../Controllers/Admin/AddCourse/lessonQuizController');
const { addBanner, updateBanner, addPDF, hardDeletePDF, addResource, hardDeleteResource } = require('../../Controllers/Admin/AddCourse/lessonFileController');
const { addCommentForAdmin, approveComment, hardDeleteCommentForAdmin, getCommentForAdmin } = require('../../Controllers/Admin/AddCourse/videoCommentController');

const { findUserForSuperAdmin, findUserForAdmin, getAllUserWallet } = require("../../Controllers/User/user");
const { bulkRegisterUserAndCreateCourseAndAssign, findAllUserForOnlyBulkCheck } = require("../../Controllers/User/bulk");

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

// Master
//Template
router.get("/templates", verifyAdminToken, isSuperAdmin, getTemplate);
router.post("/addTemplate", verifyAdminToken, isSuperAdmin, addTemplate);
router.delete("/hardDeleteTemplate/:id", verifyAdminToken, isSuperAdmin, hardDeleteTemplate);
//Tag
router.get("/tags", verifyAdminToken, isSuperAdmin, getTag);
router.post("/addTag", verifyAdminToken, isSuperAdmin, addTag);
router.delete("/hardDeleteTag/:id", verifyAdminToken, isSuperAdmin, hardDeleteTag);
//Ratio
router.get("/ratios", verifyAdminToken, isSuperAdmin, getRatio);
router.post("/addRatio", verifyAdminToken, isSuperAdmin, addRatio);
router.delete("/hardDeleteRatio/:id", verifyAdminToken, isSuperAdmin, hardDeleteRatio);
//Coupon
router.get("/coupons", verifyAdminToken, isSuperAdmin, getCoupon);
router.post("/createCoupon", verifyAdminToken, isSuperAdmin, createCoupon);
router.delete("/hardDeleteCoupon/:id", verifyAdminToken, isSuperAdmin, hardDeleteCoupon);
router.put("/addCouponToCourses", verifyAdminToken, isSuperAdmin, addCouponToCourse);
router.put("/UpdateCoupon/:id", verifyAdminToken, isSuperAdmin, UpdateCoupon);

// Course
router.post("/createCourse", verifyAdminToken, isSuperAdmin, createCourse);
router.get("/myCourses", verifyAdminToken, isSuperAdmin, getCourseForAdmin);
router.get("/courses", verifyAdminToken, isSuperAdmin, getAllCourse);
router.get("/courses/:id", verifyAdminToken, isSuperAdmin, getCourseById);
router.put("/addOrUpdateAuthorImage/:id", verifyAdminToken, isSuperAdmin, uploadImage.single("authorImage"), addOrUpdateAuthorImage);
router.put("/addOrUpdateCourseImage/:id", verifyAdminToken, isSuperAdmin, uploadImage.single("courseImage"), addOrUpdateCourseImage);
router.put("/publicCourse/:id", verifyAdminToken, isSuperAdmin, publicCourse);
router.put("/unPublicCourse/:id", verifyAdminToken, isSuperAdmin, unPublicCourse);
router.put("/updateCourse/:id", verifyAdminToken, isSuperAdmin, updateCourse);
router.delete("/deleteAuthorImage/:id", verifyAdminToken, isSuperAdmin, deleteAuthorImage);
router.delete("/deleteCourseImage/:id", verifyAdminToken, isSuperAdmin, deleteCourseImage);
// Section
router.post("/createSection", verifyAdminToken, isSuperAdmin, createSection);
router.get("/sections/:courseId", verifyAdminToken, isSuperAdmin, getAllSectionByCourseIdForAdmin);
router.put("/publicSection/:id", verifyAdminToken, isSuperAdmin, publicSection);
router.put("/updateSection/:id", verifyAdminToken, isSuperAdmin, updateSection);
router.put("/unPublicSection/:id", verifyAdminToken, isSuperAdmin, unPublicSection);
// Lesson
router.post("/createLesson", verifyAdminToken, isSuperAdmin, createLesson);
router.get("/lesson/:id", verifyAdminToken, isSuperAdmin, getLessonByLessonIdForAdmin);
router.put("/publicLesson/:id", verifyAdminToken, isSuperAdmin, publicLesson);
router.put("/updateLesson/:id", verifyAdminToken, isSuperAdmin, updateLesson);
router.put("/unPublicLesson/:id", verifyAdminToken, isSuperAdmin, unPublicLesson);
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

// User
router.get("/users", verifyAdminToken, isSuperAdmin, findUserForSuperAdmin);
router.get("/myUsers", verifyAdminToken, isSuperAdmin, findUserForAdmin);

// Payment Data
router.get("/paymentData", verifyAdminToken, isSuperAdmin, getAllPaymentData);

// Admin wallet
router.get("/adminWallet", verifyAdminToken, isSuperAdmin, getAllAdminWallet);
router.get("/userWallet", verifyAdminToken, isSuperAdmin, getAllUserWallet);

// Bulk
router.post("/bulkRegister", verifyAdminToken, isSuperAdmin, bulkRegisterUserAndCreateCourseAndAssign);
router.get("/bulkCheck", verifyAdminToken, isSuperAdmin, findAllUserForOnlyBulkCheck);

module.exports = router;