const express = require("express");
const router = express.Router();
const { body } = require('express-validator');

const { registerAdmin, loginAdmin } = require("../../Controllers/Admin/authAdmin.controller");
// const user = require('../../Controllers/Admin/User/user');
// const advisor = require('../../Controllers/Admin/Advisor/advisor');
// const member = require('../../Controllers/Admin/Member/member');
// const lead = require('../../Controllers/Admin/Lead/lead');
// const scheduleBooking = require('../../Controllers/Admin/ScheduleBooking/scheduleBooking');
// const myBooking = require('../../Controllers/Admin/MyBooking/myBooking');
// const eWallet = require('../../Controllers/Admin/EWallet/eWallet');
const { createSection, getSection, updateSection, publicSection } = require('../../Controllers/Admin/AddCourse/sectionControllers');
const { createLecture, uploadVideo, addOrUpdateLectureFile, addOrUpdateThumbNail, getLectureForAdmin, deleteLecture, deleteLectureFile,
    publicLecture, updateLecture } = require('../../Controllers/Admin/AddCourse/lectureController');
const { createAddCourse, getAddCourseForAdmin, getAddCourseById, updateAddCourse, addOrUpdateAuthorImage, addOrUpdateCourseImage,
    deleteAuthorImage, deleteCourseImage, publicAddCourse } = require('../../Controllers/Admin/AddCourse/addCourseController');

//middleware
const multer = require('multer');
const upload = multer();
const { verifyToken } = require('../../Middlewares/varifyToken');
const { isAdminPresent } = require('../../Middlewares/isAdminPresent');
const uploadImage = require('../../Middlewares/UploadFile/uploadImages');
const uploadPDF = require('../../Middlewares/UploadFile/uploadPDF');

router.post("/register", [
    body('email', 'Enter a valid Email').isEmail().exists(),
    body('password', 'Passward should have atleast six characters!').isLength({ min: 6 }).exists()
], registerAdmin);
router.post("/login", [
    body('email', 'Enter a valid Email').isEmail().exists(),
    body('password', 'Passward should have atleast six characters!').isLength({ min: 6 }).exists()
], loginAdmin);

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

router.post("/createAddCourse", verifyToken, isAdminPresent, createAddCourse);
router.get("/addCourses", verifyToken, isAdminPresent, getAddCourseForAdmin);
router.get("/getAddCourseById/:id", verifyToken, isAdminPresent, getAddCourseById);
router.put("/updateAddCourse/:id", verifyToken, isAdminPresent, updateAddCourse);
router.put("/addOrUpdateAuthorImage/:id", verifyToken, isAdminPresent, uploadImage.single("authorImage"), addOrUpdateAuthorImage);
router.put("/addOrUpdateCourseImage/:id", verifyToken, isAdminPresent, uploadImage.single("courseImage"), addOrUpdateCourseImage);
router.put("/publicAddCourse/:id", verifyToken, isAdminPresent, publicAddCourse);
router.delete("/deleteAuthorImage/:id", verifyToken, isAdminPresent, deleteAuthorImage);
router.delete("/deleteCourseImage/:id", verifyToken, isAdminPresent, deleteCourseImage);
// router.delete("/delete-addCourse/:id",verifyToken,isAdminPresent, addCourse.deleteAddCourse);

router.post("/createSection", verifyToken, isAdminPresent, createSection);
router.get("/sections/:addCourse_id", verifyToken, isAdminPresent, getSection);
router.put("/updateSection/:id", verifyToken, isAdminPresent, updateSection);
router.put("/publicSection/:id", verifyToken, isAdminPresent, publicSection);
// router.delete("/delete-section/:id",verifyToken, isAdminPresent,section.deleteSection);

router.post("/createLecture", verifyToken, isAdminPresent, createLecture);
router.put("/uploadVideo/:id", verifyToken, isAdminPresent, upload.single("video"), uploadVideo);
router.put("/addOrUpdateThumbNail/:id", verifyToken, isAdminPresent, uploadImage.single("thumbnail"), addOrUpdateThumbNail);
router.put("/addOrUpdateLectureFile/:id", verifyToken, isAdminPresent, uploadPDF.single("lecturePDFile"), addOrUpdateLectureFile);
router.get("/lectures/:section_id", verifyToken, isAdminPresent, getLectureForAdmin);
router.delete("/deleteLecture/:id", verifyToken, isAdminPresent, deleteLecture);
router.put("/updateLecture/:id", verifyToken, isAdminPresent, updateLecture);
router.put("/publicLecture/:id", verifyToken, isAdminPresent, publicLecture);
router.delete("/deleteLectureFile/:id", verifyToken, isAdminPresent, deleteLectureFile);

module.exports = router;