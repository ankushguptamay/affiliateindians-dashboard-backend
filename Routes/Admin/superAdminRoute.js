const express = require("express");
const router = express.Router();

const { registerAdmin, loginAdmin, getAllAdminWallet } = require('../../Controllers/Admin/authSuperAdminController');
const { generateCodeForAdmin } = require('../../Controllers/Admin/adminsAffiliateLinkController');

const { getAllPaymentData } = require('../../Controllers/User/purchaseCourseController');
// Master
const { addTemplateFrom, getAllFormByAdminId } = require('../../Controllers/Admin/Master/templateFormController');
const { createSchedule, getPausedScheduleForAdmin, getUnPausedScheduleForAdmin } = require('../../Controllers/Admin/Master/scheduleCallBookingController');
const { getTemplateByAdminId, addTemplate, hardDeleteTemplate } = require('../../Controllers/Admin/Master/templateController');
const { getTag, hardDeleteTag, addTag } = require('../../Controllers/Admin/Master/tagController');
const { getRatio, addRatio, hardDeleteRatio, updateRatio } = require('../../Controllers/Admin/Master/affiliateMarketingRatioController');
const { getCoupon, addCouponToCourse, createCoupon, hardDeleteCoupon, UpdateCoupon, getCouponByCourseId } = require('../../Controllers/Admin/Master/couponController');
// Course
const { createSection, getAllSectionByCourseIdForAdmin, publicSection, unPublicSection, updateSection, hardeleteSection } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { createLesson, getLessonByLessonIdForAdmin, publicLesson, unPublicLesson, updateLesson, hardDeleteLesson } = require('../../Controllers/Admin/AddCourse/lessonController');
const { createCourse, getCourseForAdmin, getAllCourse, addOrUpdateAuthorImage, addOrUpdateCourseImage, updateCourse, getCourseById, hardDeleteCourse, allowAffiliateCourse,
    disAllowAffiliateCourse, deleteAuthorImage, deleteCourseImage, publicCourse, unPublicCourse } = require('../../Controllers/Admin/AddCourse/courseController');
const { uploadLessonVideo, hardDeleteLessonVideo, getAllVideoByLessonId, addOrUpdateThumbNail, uploadVideoEmbeddedCode } = require('../../Controllers/Admin/AddCourse/lessonVideosController');
const { createLessonQuiz, getAllQuizByLessonId, hardDeleteLessonQuiz, updateLessonQuiz } = require('../../Controllers/Admin/AddCourse/lessonQuizController');
const { addBanner, updateBanner, addPDF, hardDeletePDF, addResource, hardDeleteResource } = require('../../Controllers/Admin/AddCourse/lessonFileController');
const { addCommentForAdmin, approveComment, hardDeleteCommentForAdmin, getCommentForAdmin } = require('../../Controllers/Admin/AddCourse/videoCommentController');
const { addUpSell, deleteUpSell } = require('../../Controllers/Admin/Master/upSellController');
const { createAssignment, getAssignmentAnswerByLessonIdForAdmin, hardDeleteAssignment } = require('../../Controllers/Admin/AddCourse/assignmentController');
const { addLessonText, updateLessonText, hardDeleteLessonText } = require('../../Controllers/Admin/AddCourse/lessonTextController');

const { findUserForSuperAdmin, findUnBlockUserForAdmin, findBlockUserForAdmin, getAllUserWallet, addUserToCourse, softDeleteUser, restoreUser } = require("../../Controllers/User/user");
const { bulkRegisterUserAndCreateCourseAndAssign, addUserToAllCourse } = require("../../Controllers/User/bulk");
const { getAffiliateUserIdRequestForAdmin, acceptAffiliateUserIdRequest, blockAffiliateUserIdRequest, unblockAffiliateUserIdRequest } = require("../../Controllers/User/affiliateUserIdController");


//middleware
const multer = require('multer');
const upload = multer();
const { verifyAdminToken } = require('../../Middlewares/varifyToken');
const { isSuperAdmin } = require('../../Middlewares/isPresent');
const uploadImage = require('../../Middlewares/UploadFile/uploadImages');
const uploadPDF = require('../../Middlewares/UploadFile/uploadPDF');
const uploadImageAndPDF = require('../../Middlewares/UploadFile/uploadImageAndPDF');
const uploadImageDocumentPresentation = require('../../Middlewares/UploadFile/uploadImageDocumentPresentation');

// Route
// Super Admin 
// router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Affiliate Link
router.post("/generateSaleLinkCode", verifyAdminToken, isSuperAdmin, generateCodeForAdmin);

// Master
//Template
router.get("/templates", verifyAdminToken, isSuperAdmin, getTemplateByAdminId);
router.post("/addTemplate", verifyAdminToken, isSuperAdmin, uploadImage.single("templateImage"), addTemplate);
router.delete("/hardDeleteTemplate/:id", verifyAdminToken, isSuperAdmin, hardDeleteTemplate);
//TemplateForm
router.get("/forms", verifyAdminToken, isSuperAdmin, getAllFormByAdminId);
router.post("/addForm", verifyAdminToken, isSuperAdmin, addTemplateFrom);
//Tag
router.get("/tags", verifyAdminToken, isSuperAdmin, getTag);
router.post("/addTag", verifyAdminToken, isSuperAdmin, addTag);
router.delete("/hardDeleteTag/:id", verifyAdminToken, isSuperAdmin, hardDeleteTag);
//Ratio
router.get("/ratios", verifyAdminToken, isSuperAdmin, getRatio);
router.post("/addRatio", verifyAdminToken, isSuperAdmin, addRatio);
router.delete("/hardDeleteRatio/:id", verifyAdminToken, isSuperAdmin, hardDeleteRatio);
router.put("/updateRatio/:id", verifyAdminToken, isSuperAdmin, updateRatio);
//Coupon
router.get("/coupons", verifyAdminToken, isSuperAdmin, getCoupon);
router.get("/couponByCourse/:courseId", verifyAdminToken, isSuperAdmin, getCouponByCourseId);
router.post("/createCoupon", verifyAdminToken, isSuperAdmin, createCoupon);
router.delete("/hardDeleteCoupon/:id", verifyAdminToken, isSuperAdmin, hardDeleteCoupon);
router.put("/addCouponToCourses", verifyAdminToken, isSuperAdmin, addCouponToCourse);
router.put("/UpdateCoupon/:id", verifyAdminToken, isSuperAdmin, UpdateCoupon);
//Schedule
router.get("/pausedSchedule", verifyAdminToken, isSuperAdmin, getPausedScheduleForAdmin);
router.get("/unPausedSchedule", verifyAdminToken, isSuperAdmin, getUnPausedScheduleForAdmin);
router.post("/createSchedule", verifyAdminToken, isSuperAdmin, createSchedule);

// Course
router.post("/createCourse", verifyAdminToken, isSuperAdmin, createCourse);
router.get("/myCourses", verifyAdminToken, isSuperAdmin, getCourseForAdmin);
router.get("/courses", verifyAdminToken, isSuperAdmin, getAllCourse);
router.get("/courses/:id", verifyAdminToken, isSuperAdmin, getCourseById);
router.put("/addOrUpdateAuthorImage/:id", verifyAdminToken, isSuperAdmin, uploadImage.single("authorImage"), addOrUpdateAuthorImage);
router.put("/addOrUpdateCourseImage/:id", verifyAdminToken, isSuperAdmin, uploadImage.single("courseImage"), addOrUpdateCourseImage);
router.put("/publicCourse/:id", verifyAdminToken, isSuperAdmin, publicCourse);
router.put("/unPublicCourse/:id", verifyAdminToken, isSuperAdmin, unPublicCourse);
router.put("/allowAffiliateCourse/:id", verifyAdminToken, isSuperAdmin, allowAffiliateCourse);
router.put("/disAllowAffiliateCourse/:id", verifyAdminToken, isSuperAdmin, disAllowAffiliateCourse);
router.put("/updateCourse/:id", verifyAdminToken, isSuperAdmin, updateCourse);
router.delete("/deleteAuthorImage/:id", verifyAdminToken, isSuperAdmin, deleteAuthorImage);
router.delete("/deleteCourseImage/:id", verifyAdminToken, isSuperAdmin, deleteCourseImage);
router.delete("/hardDeleteCourse/:id", verifyAdminToken, isSuperAdmin, hardDeleteCourse);
// Section
router.post("/createSection", verifyAdminToken, isSuperAdmin, createSection);
router.get("/sections/:courseId", verifyAdminToken, isSuperAdmin, getAllSectionByCourseIdForAdmin);
router.put("/publicSection/:id", verifyAdminToken, isSuperAdmin, publicSection);
router.put("/updateSection/:id", verifyAdminToken, isSuperAdmin, updateSection);
router.put("/unPublicSection/:id", verifyAdminToken, isSuperAdmin, unPublicSection);
router.delete("/hardDeleteSection/:id", verifyAdminToken, isSuperAdmin, hardeleteSection);
// Lesson
router.post("/createLesson", verifyAdminToken, isSuperAdmin, createLesson);
router.get("/lesson/:id", verifyAdminToken, isSuperAdmin, getLessonByLessonIdForAdmin);
router.put("/publicLesson/:id", verifyAdminToken, isSuperAdmin, publicLesson);
router.put("/updateLesson/:id", verifyAdminToken, isSuperAdmin, updateLesson);
router.put("/unPublicLesson/:id", verifyAdminToken, isSuperAdmin, unPublicLesson);
router.delete("/hardDeleteLesson/:id", verifyAdminToken, isSuperAdmin, hardDeleteLesson);
// Files
router.post("/addBanner/:lessonId", verifyAdminToken, isSuperAdmin, uploadImage.single("lessonBanner"), addBanner);
router.post("/addPDF/:lessonId", verifyAdminToken, isSuperAdmin, uploadPDF.array("lessonPDF", 10), addPDF);
router.post("/addResource/:lessonId", verifyAdminToken, isSuperAdmin, uploadImageDocumentPresentation.array("lessonResource", 10), addResource);
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
router.post("/uploadVideoEmbeddedCode/:lessonId", verifyAdminToken, isSuperAdmin, uploadVideoEmbeddedCode);
// Comment
router.post("/addComment/:lessonVideoId", verifyAdminToken, isSuperAdmin, uploadImageAndPDF.array("commentFile", 10), addCommentForAdmin);
router.get("/comment/:lessonVideoId", verifyAdminToken, isSuperAdmin, getCommentForAdmin);
router.delete("/hardDeleteComment/:id", verifyAdminToken, isSuperAdmin, hardDeleteCommentForAdmin);
router.put("/approveComment/:id", verifyAdminToken, isSuperAdmin, approveComment);
//UpSell
router.post("/addUpSell", verifyAdminToken, isSuperAdmin, addUpSell);
router.delete("/deleteUpSell/:id", verifyAdminToken, isSuperAdmin, deleteUpSell);
//Assignment
router.post("/createAssignment/:id", verifyAdminToken, isSuperAdmin, createAssignment); // lessonId
router.get("/getAssignmentAnswer/:id", verifyAdminToken, isSuperAdmin, getAssignmentAnswerByLessonIdForAdmin); // lessonId
router.delete("/hardDeleteAnswer/:id", verifyAdminToken, isSuperAdmin, hardDeleteAssignment); // assignmentId
//LessonText
router.post("/addLessonText/:lessonId", verifyAdminToken, isSuperAdmin, addLessonText); // lessonId
router.put("/updateLessonText/:id", verifyAdminToken, isSuperAdmin, updateLessonText); // lessonTextId
router.delete("/hardDeleteLessonText/:id", verifyAdminToken, isSuperAdmin, hardDeleteLessonText); // lessonTextId

// User
router.get("/users", verifyAdminToken, isSuperAdmin, findUserForSuperAdmin);
router.get("/myUsers", verifyAdminToken, isSuperAdmin, findUnBlockUserForAdmin);
router.get("/myBlockUsers", verifyAdminToken, isSuperAdmin, findBlockUserForAdmin);
router.post("/addUserToCourse", verifyAdminToken, isSuperAdmin, addUserToCourse);
router.put("/blockUser/:id", verifyAdminToken, isSuperAdmin, softDeleteUser);
router.put("/unBlockUser/:id", verifyAdminToken, isSuperAdmin, restoreUser);
// AffiliateUserIdRequest
router.get("/getAffiliateUserIdRequest", verifyAdminToken, isSuperAdmin, getAffiliateUserIdRequestForAdmin);
router.put("/acceptAffiliateUserIdRequest/:id", verifyAdminToken, isSuperAdmin, acceptAffiliateUserIdRequest);
router.put("/blockAffiliateUserIdRequest/:id", verifyAdminToken, isSuperAdmin, blockAffiliateUserIdRequest);
router.put("/unblockAffiliateUserIdRequest/:id", verifyAdminToken, isSuperAdmin, unblockAffiliateUserIdRequest);

// Payment Data
router.get("/paymentData", verifyAdminToken, isSuperAdmin, getAllPaymentData);

// Admin wallet
router.get("/adminWallet", verifyAdminToken, isSuperAdmin, getAllAdminWallet);
router.get("/userWallet", verifyAdminToken, isSuperAdmin, getAllUserWallet);

// Bulk
// router.post("/bulkRegister", verifyAdminToken, isSuperAdmin, bulkRegisterUserAndCreateCourseAndAssign);
// router.post("/addUserToAllCourse/:id", verifyAdminToken, isSuperAdmin, addUserToAllCourse);

module.exports = router;