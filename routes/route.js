module.exports = (app) => {
    const user = require('../controllers/user.js');

    const router = require('express').Router();

    router.post("/add-users", user.create);
    // router.get("/users", user.findAll);
    // router.delete("/delete/:id", user.delete);
    // router.put("/update/:id", user.update);
    app.use("/api/dashboard", router);

};