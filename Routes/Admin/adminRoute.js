const express = require("express");
const router = express.Router();
const { body } = require('express-validator');

const user = require('../../Controllers/Admin/User/user');
const advisor = require('../../Controllers/Admin/Advisor/advisor');
const member = require('../../Controllers/Admin/Member/member');
const lead = require('../../Controllers/Admin/Lead/lead');
const scheduleBooking = require('../../Controllers/Admin/ScheduleBooking/scheduleBooking');
const myBooking = require('../../Controllers/Admin/MyBooking/myBooking');
const eWallet = require('../../Controllers/Admin/EWallet/eWallet');

//middleware
const { verifyToken } = require('../../Middlewares/varifyToken');
const { isAdminPresent } = require('../../Middlewares/isAdminPresent');
const uploadImage = require('../../Middlewares/uploadImages');

router.post("/add-users", user.create);
router.get("/users", user.findAll);
router.delete("/delete-users/:id", user.delete);
router.put("/update-users/:id", user.update);

router.post("/add-advisors", verifyToken, isAdminPresent, uploadImage.single("advisorImage"), [
    body('email', 'Enter a valid Email').isEmail().optional()
], advisor.createAdvisor);
router.get("/advisors", verifyToken, isAdminPresent, advisor.getAllAdvisor);
router.delete("/delete-advisors/:id", verifyToken, isAdminPresent, advisor.deleteAdvisor);
router.put("/update-advisors/:id", verifyToken, isAdminPresent, [
    body('email', 'Enter a valid Email').isEmail().optional()
], advisor.updateAdvisor);

router.post("/add-members", member.create);
router.get("/members", member.findAll);
router.delete("/delete-members/:id", member.delete);
router.put("/update-members/:id", member.update);

router.post("/add-leads", lead.create);
router.get("/leads", lead.findAll);
router.delete("/delete-leads/:id", lead.delete);
router.put("/update-leads/:id", lead.update);

router.post("/add-scheduleBookings", scheduleBooking.create);
router.get("/scheduleBookings", scheduleBooking.findAll);
router.delete("/delete-scheduleBookings/:id", scheduleBooking.delete);
router.put("/update-scheduleBookings/:id", scheduleBooking.update);

router.post("/add-myBookings", myBooking.create);
router.get("/myBookings", myBooking.findAll);
router.delete("/delete-myBookings/:id", myBooking.delete);
router.put("/update-myBookings/:id", myBooking.update);

router.post("/add-eWallets", eWallet.create);
router.get("/eWallets", eWallet.findAll);
router.delete("/delete-eWallets/:id", eWallet.delete);
router.put("/update-eWallets/:id", eWallet.update);

module.exports = router;