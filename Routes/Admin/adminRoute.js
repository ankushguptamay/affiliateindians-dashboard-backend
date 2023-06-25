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
const section = require('../../Controllers/Admin/AddCourse/sectionControllers');
const lecture = require('../../Controllers/Admin/AddCourse/lectureController');
const { createAddCourse, getAddCourseForAdmin, getAddCourseById, updateAddCourse, addOrUpdateAuthorImage, addOrUpdateCourseImage,
    deleteAuthorImage, deleteCourseImage } = require('../../Controllers/Admin/AddCourse/addCourseController');

//middleware
const multer = require('multer');
const upload = multer();
const { verifyToken } = require('../../Middlewares/varifyToken');
const { isAdminPresent } = require('../../Middlewares/isAdminPresent');
const uploadImage = require('../../Middlewares/UploadFile/uploadImages');
const uploadImageOrPDF = require('../../Middlewares/UploadFile/uploadImageOrPDF');

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
router.delete("/deleteAuthorImage/:id", verifyToken, isAdminPresent, deleteAuthorImage);
router.delete("/deleteCourseImage/:id", verifyToken, isAdminPresent, deleteCourseImage);
// router.delete("/delete-addCourse/:id",verifyToken,isAdminPresent, addCourse.deleteAddCourse);

router.post("/create-section", verifyToken, isAdminPresent, section.createCourseSection);
router.get("/sections/:addCourse_id", verifyToken, isAdminPresent, section.getSection);
// router.delete("/delete-section/:id",verifyToken, isAdminPresent,section.deleteSection);

router.post("/createLecture", verifyToken, isAdminPresent, upload.single("video"), lecture.createLecture);
router.put("/addThumbNail/:id", verifyToken, isAdminPresent, uploadImageOrPDF.single("thumbnail"), lecture.addThumbNail);
router.put("/addLectureFile/:id", verifyToken, isAdminPresent, uploadImageOrPDF.single("lectureFile"), lecture.addLectureFile);
router.get("/lectures/:section_id", verifyToken, isAdminPresent, lecture.getLecture);
router.delete("/delete-lecture/:id", verifyToken, isAdminPresent, lecture.deleteLecture);
router.put("/update-lecture/:id", verifyToken, isAdminPresent, lecture.updateLecture);

module.exports = router;