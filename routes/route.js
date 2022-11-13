module.exports = (app) => {
    const user = require('../controllers/user.js');
    const advisor = require('../controllers/advisor.js');
    const member = require('../controllers/member.js')
    const lead = require('../controllers/lead.js')

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

    app.use("/api/dashboard", router);

};