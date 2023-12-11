const express = require("express");
const router = express.Router();

const { registerAdmin, loginAdmin } = require('../../Controllers/Admin/authAdminController');
const { generateCodeForAdmin } = require('../../Controllers/Admin/adminsAffiliateLinkController');

// Master
const { getTemplateByAdminId, addTemplate, hardDeleteTemplate } = require('../../Controllers/Admin/Master/templateController');
const { createSchedule, getPausedScheduleForAdmin, getUnPausedScheduleForAdmin } = require('../../Controllers/Admin/Master/scheduleCallBookingController');
const { getTag } = require('../../Controllers/Admin/Master/tagController');
const { getCoupon, addCouponToCourse, createCoupon, UpdateCoupon, getCouponByCourseId, hardDeleteCoupon } = require('../../Controllers/Admin/Master/couponController');
const { getRatio, addRatio, updateRatio, hardDeleteRatio } = require('../../Controllers/Admin/Master/affiliateMarketingRatioController');
const { addTemplateFrom, getAllFormByAdminId } = require('../../Controllers/Admin/Master/templateFormController');
// Course
const { createSection, getAllSectionByCourseIdForAdmin, publicSection, unPublicSection, updateSection, hardeleteSection } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { createLesson, getLessonByLessonIdForAdmin, publicLesson, unPublicLesson, updateLesson, hardDeleteLesson } = require('../../Controllers/Admin/AddCourse/lessonController');
const { createCourse, getCourseForAdmin, addOrUpdateAuthorImage, addOrUpdateCourseImage, updateCourse, hardDeleteCourse, getCourseById, allowAffiliateCourse,
    disAllowAffiliateCourse, deleteAuthorImage, deleteCourseImage, publicCourse, unPublicCourse } = require('../../Controllers/Admin/AddCourse/courseController');
const { uploadLessonVideo, hardDeleteLessonVideo, getAllVideoByLessonId, addOrUpdateThumbNail, uploadVideoEmbeddedCode } = require('../../Controllers/Admin/AddCourse/lessonVideosController');
const { createLessonQuiz, getAllQuizByLessonId, hardDeleteLessonQuiz, updateLessonQuiz } = require('../../Controllers/Admin/AddCourse/lessonQuizController');
const { addBanner, updateBanner, addPDF, hardDeletePDF, addResource, hardDeleteResource } = require('../../Controllers/Admin/AddCourse/lessonFileController');
const { addCommentForAdmin, approveComment, hardDeleteCommentForAdmin, getCommentForAdmin } = require('../../Controllers/Admin/AddCourse/videoCommentController');
const { addUpSell, deleteUpSell } = require('../../Controllers/Admin/Master/upSellController');
const { createAssignment, getAssignmentAnswerByLessonIdForAdmin, hardDeleteAssignment } = require('../../Controllers/Admin/AddCourse/assignmentController');
const { addLessonText, updateLessonText, hardDeleteLessonText } = require('../../Controllers/Admin/AddCourse/lessonTextController');

// Teacher
const { registerTeacher } = require("../../Controllers/Admin/Teacher/teacherController");
// User
const { findUserForAdmin, addUserToCourse } = require("../../Controllers/User/user");
const { getAffiliateUserIdRequestForAdmin, acceptAffiliateUserIdRequest, blockAffiliateUserIdRequest, unblockAffiliateUserIdRequest } = require("../../Controllers/User/affiliateUserIdController");

//middleware
const multer = require('multer');
const upload = multer();
const { verifyAdminToken } = require('../../Middlewares/varifyToken');
const { isAdmin } = require('../../Middlewares/isPresent');
const uploadImage = require('../../Middlewares/UploadFile/uploadImages');
const uploadPDF = require('../../Middlewares/UploadFile/uploadPDF');
const uploadImageAndPDF = require('../../Middlewares/UploadFile/uploadImageAndPDF');
const uploadImageDocumentPresentation = require('../../Middlewares/UploadFile/uploadImageDocumentPresentation');

// Admin
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
// Affiliate Link
router.post("/generateSaleLinkCode", verifyAdminToken, isAdmin, generateCodeForAdmin);
// Master
//Template
router.get("/templates", verifyAdminToken, isAdmin, getTemplateByAdminId);
router.post("/addTemplate", verifyAdminToken, isAdmin, uploadImage.single("templateImage"), addTemplate);
router.delete("/hardDeleteTemplate/:id", verifyAdminToken, isAdmin, hardDeleteTemplate);
//TemplateForm
router.get("/forms", verifyAdminToken, isAdmin, getAllFormByAdminId);
router.post("/addForm", verifyAdminToken, isAdmin, addTemplateFrom);
//Tag
router.get("/tags", verifyAdminToken, isAdmin, getTag);
//Ratio
router.get("/ratios", verifyAdminToken, isAdmin, getRatio);
router.post("/addRatio", verifyAdminToken, isAdmin, addRatio);
router.delete("/hardDeleteRatio/:id", verifyAdminToken, isAdmin, hardDeleteRatio);
router.put("/updateRatio/:id", verifyAdminToken, isAdmin, updateRatio);
//Coupon
router.get("/coupons", verifyAdminToken, isAdmin, getCoupon);
router.get("/couponByCourse/:courseId", verifyAdminToken, isAdmin, getCouponByCourseId);
router.post("/createCoupon", verifyAdminToken, isAdmin, createCoupon);
router.put("/addCouponToCourses", verifyAdminToken, isAdmin, addCouponToCourse);
router.delete("/hardDeleteCoupon/:id", verifyAdminToken, isAdmin, hardDeleteCoupon);
router.put("/UpdateCoupon/:id", verifyAdminToken, isAdmin, UpdateCoupon);
//Schedule
router.get("/pausedSchedule", verifyAdminToken, isAdmin, getPausedScheduleForAdmin);
router.get("/unPausedSchedule", verifyAdminToken, isAdmin, getUnPausedScheduleForAdmin);
router.post("/createSchedule", verifyAdminToken, isAdmin, createSchedule);

// Teacher
// router.post("/registerTeacher", verifyAdminToken, isAdmin, registerTeacher);

// Course
router.post("/createCourse", verifyAdminToken, isAdmin, createCourse);
router.get("/myCourses", verifyAdminToken, isAdmin, getCourseForAdmin);
router.get("/courses/:id", verifyAdminToken, isAdmin, getCourseById);
router.put("/addOrUpdateAuthorImage/:id", verifyAdminToken, isAdmin, uploadImage.single("authorImage"), addOrUpdateAuthorImage);
router.put("/addOrUpdateCourseImage/:id", verifyAdminToken, isAdmin, uploadImage.single("courseImage"), addOrUpdateCourseImage);
router.put("/publicCourse/:id", verifyAdminToken, isAdmin, publicCourse);
router.put("/unPublicCourse/:id", verifyAdminToken, isAdmin, unPublicCourse);
router.put("/allowAffiliateCourse/:id", verifyAdminToken, isAdmin, allowAffiliateCourse);
router.put("/disAllowAffiliateCourse/:id", verifyAdminToken, isAdmin, disAllowAffiliateCourse);
router.put("/updateCourse/:id", verifyAdminToken, isAdmin, updateCourse);
router.delete("/deleteAuthorImage/:id", verifyAdminToken, isAdmin, deleteAuthorImage);
router.delete("/deleteCourseImage/:id", verifyAdminToken, isAdmin, deleteCourseImage);
router.delete("/hardDeleteCourse/:id", verifyAdminToken, isAdmin, hardDeleteCourse);
// Section
router.post("/createSection", verifyAdminToken, isAdmin, createSection);
router.get("/sections/:courseId", verifyAdminToken, isAdmin, getAllSectionByCourseIdForAdmin);
router.put("/publicSection/:id", verifyAdminToken, isAdmin, publicSection);
router.put("/updateSection/:id", verifyAdminToken, isAdmin, updateSection);
router.put("/unPublicSection/:id", verifyAdminToken, isAdmin, unPublicSection);
router.delete("/hardDeleteSection/:id", verifyAdminToken, isAdmin, hardeleteSection);
// Lesson
router.post("/createLesson", verifyAdminToken, isAdmin, createLesson);
router.get("/lesson/:id", verifyAdminToken, isAdmin, getLessonByLessonIdForAdmin);
router.put("/publicLesson/:id", verifyAdminToken, isAdmin, publicLesson);
router.put("/updateLesson/:id", verifyAdminToken, isAdmin, updateLesson);
router.put("/unPublicLesson/:id", verifyAdminToken, isAdmin, unPublicLesson);
router.delete("/hardDeleteLesson/:id", verifyAdminToken, isAdmin, hardDeleteLesson);
// Video
router.post("/uploadVideo/:lessonId", verifyAdminToken, isAdmin, upload.single("lessonVideo"), uploadLessonVideo);
router.put("/addOrUpdateThumbNail/:id", verifyAdminToken, isAdmin, uploadImage.single("thumbnail"), addOrUpdateThumbNail);
router.get("/videos/:lessonId", verifyAdminToken, isAdmin, getAllVideoByLessonId);
router.delete("/hardDeleteVideo/:id", verifyAdminToken, isAdmin, hardDeleteLessonVideo);
router.post("/uploadVideoEmbeddedCode/:lessonId", verifyAdminToken, isAdmin, uploadVideoEmbeddedCode);
// Quiz
router.post("/createQuiz/:lessonId", verifyAdminToken, isAdmin, createLessonQuiz);
router.get("/quizs/:lessonId", verifyAdminToken, isAdmin, getAllQuizByLessonId);
router.put("/updateQuiz/:id", verifyAdminToken, isAdmin, updateLessonQuiz);
router.delete("/hardDeleteQuiz/:id", verifyAdminToken, isAdmin, hardDeleteLessonQuiz);
// Files
router.post("/addBanner/:lessonId", verifyAdminToken, isAdmin, uploadImage.single("lessonBanner"), addBanner);
router.post("/addPDF/:lessonId", verifyAdminToken, isAdmin, uploadPDF.array("lessonPDF", 10), addPDF);
router.post("/addResource/:lessonId", verifyAdminToken, isAdmin, uploadImageDocumentPresentation.array("lessonResource", 10), addResource);
router.delete("/hardDeletePDF/:id", verifyAdminToken, isAdmin, hardDeletePDF);
router.put("/updateBanner/:id", verifyAdminToken, isAdmin, uploadImage.single("lessonBanner"), updateBanner);
router.delete("/hardDeleteResource/:id", verifyAdminToken, isAdmin, hardDeleteResource);
// Comment
router.post("/addComment/:lessonVideoId", verifyAdminToken, isAdmin, uploadImageAndPDF.array("commentFile", 10), addCommentForAdmin);
router.get("/comment/:lessonVideoId", verifyAdminToken, isAdmin, getCommentForAdmin);
router.delete("/hardDeleteComment/:id", verifyAdminToken, isAdmin, hardDeleteCommentForAdmin);
router.put("/approveComment/:id", verifyAdminToken, isAdmin, approveComment);
//UpSell
router.post("/addUpSell", verifyAdminToken, isAdmin, addUpSell);
router.delete("/deleteUpSell/:id", verifyAdminToken, isAdmin, deleteUpSell);
//Assignment
router.post("/createAssignment/:id", verifyAdminToken, isAdmin, createAssignment); // lessonId
router.get("/getAssignmentAnswer/:id", verifyAdminToken, isAdmin, getAssignmentAnswerByLessonIdForAdmin); // lessonId
router.delete("/hardDeleteAnswer/:id", verifyAdminToken, isAdmin, hardDeleteAssignment); // assignmentId
//LessonText
router.post("/addLessonText/:lessonId", verifyAdminToken, isAdmin, addLessonText); // lessonId
router.put("/updateLessonText/:id", verifyAdminToken, isAdmin, updateLessonText); // lessonTextId
router.delete("/hardDeleteLessonText/:id", verifyAdminToken, isAdmin, hardDeleteLessonText); // lessonTextId

// User
router.get("/myUsers", verifyAdminToken, isAdmin, findUserForAdmin);
router.post("/addUserToCourse", verifyAdminToken, isAdmin, addUserToCourse);
// AffiliateUserIdRequest
router.get("/getAffiliateUserIdRequest", verifyAdminToken, isAdmin, getAffiliateUserIdRequestForAdmin);
router.put("/acceptAffiliateUserIdRequest/:id", verifyAdminToken, isAdmin, acceptAffiliateUserIdRequest);
router.put("/blockAffiliateUserIdRequest/:id", verifyAdminToken, isAdmin, blockAffiliateUserIdRequest);
router.put("/unblockAffiliateUserIdRequest/:id", verifyAdminToken, isAdmin, unblockAffiliateUserIdRequest);

module.exports = router;