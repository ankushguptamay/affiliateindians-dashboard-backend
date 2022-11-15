module.exports = (app) => {
    const user = require('../controllers/user/user.js');
    const advisor = require('../controllers/advisor/advisor.js');
    const member = require('../controllers/member/member.js');
    const lead = require('../controllers/lead/lead.js');
    const scheduleBooking = require('../controllers/scheduleBooking/scheduleBooking.js');
    const myBooking = require('../controllers/myBooking/myBooking.js');
    const eWallet = require('../controllers/eWallet/eWallet.js');

    const router = require('express').Router();

    router.post("/add-users", user.create);
    router.get("/users", user.findAll);
    router.delete("/delete-users/:id", user.delete);
    router.put("/update-users/:id", user.update);

    router.post("/add-advisors", advisor.create);
    router.get("/advisors", advisor.findAll);
    router.delete("/delete-advisors/:id", advisor.delete);
    router.put("/update-advisors/:id", advisor.update);

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

    app.use("/api/dashboard", router);

};