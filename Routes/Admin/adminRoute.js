const express = require("express");
const router = express.Router();

// const user = require('../../Controllers/Admin/User/user');
// const advisor = require('../../Controllers/Admin/Advisor/advisor');
// const member = require('../../Controllers/Admin/Member/member');
// const lead = require('../../Controllers/Admin/Lead/lead');
// const scheduleBooking = require('../../Controllers/Admin/ScheduleBooking/scheduleBooking');
// const myBooking = require('../../Controllers/Admin/MyBooking/myBooking');
// const eWallet = require('../../Controllers/Admin/EWallet/eWallet');
const { createSection, getAllSectionByCourseId, updateSection, publicSection, deleteSection } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { createLesson, getLessonByLessonId, publicLesson, updateLesson, deleteLesson } = require('../../Controllers/Admin/AddCourse/lessonController');
const { createCourse, getCourseForAdmin, updateCourse, addOrUpdateAuthorImage, addOrUpdateCourseImage,
    deleteAuthorImage, deleteCourseImage, publicCourse, deleteCourse } = require('../../Controllers/Admin/AddCourse/courseController');
const { uploadLessonVideo, deleteLessonVideo, getAllVideoByLessonId, addOrUpdateThumbNail, purgeURL } = require('../../Controllers/Admin/AddCourse/lessonVideosController');
const { createLessonQuiz, getAllQuizByLessonId, deleteLessonQuiz, updateLessonQuiz } = require('../../Controllers/Admin/AddCourse/lessonQuizController');
const { addBanner, updateBanner, addPDF, deletePDF, addResource, deleteResource } = require('../../Controllers/Admin/AddCourse/lessonFileController');
const { addCommentForAdmin, approveComment, deleteCommentForAdmin, getCommentForAdmin } = require('../../Controllers/Admin/AddCourse/videoCommentController');
const { bulkRegisterUserAndCreateCourseAndAssign } = require('../../Controllers/User/user_courseController');
const { findAllUser  } = require("../../Controllers/User/user");

//middleware
const multer = require('multer');
const upload = multer();
const { verifyAdminToken } = require('../../Middlewares/varifyToken');
const { isAdminPresent } = require('../../Middlewares/isAdminPresent');
const uploadImage = require('../../Middlewares/UploadFile/uploadImages');
const uploadPDF = require('../../Middlewares/UploadFile/uploadPDF');
const uploadImageAndPDF = require('../../Middlewares/UploadFile/uploadImageAndPDF');

// router.post("/create-users", user.create);
// router.get("/users", user.findAll);
// router.delete("/delete-users/:id", user.delete);
// router.put("/update-users/:id", user.update);

// router.post("/create-advisors", verifyToken, isAdminPresent, uploadImage.single("advisorImage"), [
//     body('email', 'Enter a valid Email').isEmail().exists()
// ], advisor.createAdvisor);
// router.get("/advisors", verifyToken, isAdminPresent, advisor.getAllAdvisor);
// router.delete("/delete-advisors/:id", verifyToken, isAdminPresent, advisor.deleteAdvisor);
// router.put("/update-advisors/:id", verifyToken, isAdminPresent, uploadImage.single("advisorImage"), [
//     body('email', 'Enter a valid Email').isEmail().optional()
// ], advisor.updateAdvisor);

// router.post("/create-members", member.create);
// router.get("/members", member.findAll);
// router.delete("/delete-members/:id", member.delete);
// router.put("/update-members/:id", member.update);

// router.post("/create-leads", lead.create);
// router.get("/leads", lead.findAll);
// router.delete("/delete-leads/:id", lead.delete);
// router.put("/update-leads/:id", lead.update);

// router.post("/create-scheduleBookings", scheduleBooking.create);
// router.get("/scheduleBookings", scheduleBooking.findAll);
// router.delete("/delete-scheduleBookings/:id", scheduleBooking.delete);
// router.put("/update-scheduleBookings/:id", scheduleBooking.update);

// router.post("/create-myBookings", myBooking.create);
// router.get("/myBookings", myBooking.findAll);
// router.delete("/delete-myBookings/:id", myBooking.delete);
// router.put("/update-myBookings/:id", myBooking.update);

// router.post("/create-eWallets", eWallet.create);
// router.get("/eWallets", eWallet.findAll);
// router.delete("/delete-eWallets/:id", eWallet.delete);
// router.put("/update-eWallets/:id", eWallet.update);

router.post("/createCourse", verifyAdminToken, isAdminPresent, createCourse);
router.get("/courses", verifyAdminToken, isAdminPresent, getCourseForAdmin);
router.put("/updateCourse/:id", verifyAdminToken, isAdminPresent, updateCourse);
router.put("/addOrUpdateAuthorImage/:id", verifyAdminToken, isAdminPresent, uploadImage.single("authorImage"), addOrUpdateAuthorImage);
router.put("/addOrUpdateCourseImage/:id", verifyAdminToken, isAdminPresent, uploadImage.single("courseImage"), addOrUpdateCourseImage);
router.put("/publicCourse/:id", verifyAdminToken, isAdminPresent, publicCourse);
router.delete("/deleteAuthorImage/:id", verifyAdminToken, isAdminPresent, deleteAuthorImage);
router.delete("/deleteCourseImage/:id", verifyAdminToken, isAdminPresent, deleteCourseImage);
router.delete("/deleteCourse/:id", verifyAdminToken, isAdminPresent, deleteCourse);

router.post("/createSection", verifyAdminToken, isAdminPresent, createSection);
router.get("/sections/:courseId", verifyAdminToken, isAdminPresent, getAllSectionByCourseId);
router.put("/updateSection/:id", verifyAdminToken, isAdminPresent, updateSection);
router.put("/publicSection/:id", verifyAdminToken, isAdminPresent, publicSection);
router.delete("/deleteSection/:id", verifyAdminToken, isAdminPresent, deleteSection);

router.post("/createLesson", verifyAdminToken, isAdminPresent, createLesson);
router.get("/lesson/:id", verifyAdminToken, isAdminPresent, getLessonByLessonId);
router.put("/updateLesson/:id", verifyAdminToken, isAdminPresent, updateLesson);
router.put("/publicLesson/:id", verifyAdminToken, isAdminPresent, publicLesson);
router.delete("/deleteLesson/:id", verifyAdminToken, isAdminPresent, deleteLesson);

router.post("/uploadVideo/:lessonId", verifyAdminToken, isAdminPresent, upload.single("lessonVideo"), uploadLessonVideo);
router.put("/addOrUpdateThumbNail/:id", verifyAdminToken, isAdminPresent, uploadImage.single("thumbnail"), addOrUpdateThumbNail);
router.get("/videos/:lessonId", verifyAdminToken, isAdminPresent, getAllVideoByLessonId);
router.delete("/deleteVideo/:id", verifyAdminToken, isAdminPresent, deleteLessonVideo);

router.post("/createQuiz/:lessonId", verifyAdminToken, isAdminPresent, createLessonQuiz);
router.get("/quizs/:lessonId", verifyAdminToken, isAdminPresent, getAllQuizByLessonId);
router.put("/updateQuiz/:id", verifyAdminToken, isAdminPresent, updateLessonQuiz);
router.delete("/deleteQuiz/:id", verifyAdminToken, isAdminPresent, deleteLessonQuiz);

router.post("/addBanner/:lessonId", verifyAdminToken, isAdminPresent, uploadImage.single("lessonBanner"), addBanner);
router.post("/addPDF/:lessonId", verifyAdminToken, isAdminPresent, uploadPDF.array("lessonPDF", 10), addPDF);
router.post("/addResource/:lessonId", verifyAdminToken, isAdminPresent, uploadImageAndPDF.array("lessonResource", 10), addResource);
router.delete("/deletePDF/:id", verifyAdminToken, isAdminPresent, deletePDF);
router.put("/updateBanner/:id", verifyAdminToken, isAdminPresent, uploadImage.single("lessonBanner"), updateBanner);
router.delete("/deleteResource/:id", verifyAdminToken, isAdminPresent, deleteResource);

router.post("/addComment/:lessonVideoId", verifyAdminToken, isAdminPresent, uploadImageAndPDF.array("commentFile", 10), addCommentForAdmin);
router.get("/comment/:lessonVideoId", verifyAdminToken, isAdminPresent, getCommentForAdmin);
router.delete("/deleteComment/:id", verifyAdminToken, isAdminPresent, deleteCommentForAdmin);
router.put("/approveComment/:id", verifyAdminToken, isAdminPresent, approveComment);

router.get("/findAllUser", verifyAdminToken, isAdminPresent, findAllUser);

router.get("/purgeURL", purgeURL);
router.post("/bulkRegister", verifyAdminToken, isAdminPresent, bulkRegisterUserAndCreateCourseAndAssign);

module.exports = router;