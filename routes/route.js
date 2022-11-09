module.exports = (app) => {
    const user = require('../controllers/user.js');
    const advisor = require('../controllers/advisor.js');   

    const router = require('express').Router();

    router.post("/add-users", user.create);
    router.get("/registered-users", user.findAll);
    router.delete("/delete-users/:id", user.delete);
    router.put("/update-users/:id", user.update);
    app.use("/api/dashboard", router);

};