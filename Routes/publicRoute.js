const express = require("express");
const router = express.Router();
const { redirectByTag } = require('../Controllers/Admin/adminsAffiliateLinkController');
const { getAllCourse, getCourseByIdForUser } = require('../Controllers/Admin/AddCourse/courseController');

// Sale Link
router.post("/redirectByTag/:saleLinkCode", redirectByTag); // In this controller frond domain is hard coded, and i add a query params in original link to track payment by thia link
// Course
router.get("/courses", getAllCourse);
router.get("/courses/:id", getCourseByIdForUser);

module.exports = router;