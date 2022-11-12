module.exports = (app) => {
    const user = require('../controllers/user.js');
    const advisor = require('../controllers/advisor.js');
    const member = require('../controllers/member.js')

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

    app.use("/api/dashboard", router);

};