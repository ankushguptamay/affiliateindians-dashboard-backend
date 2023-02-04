const db = require('../Models');
const Admin = db.admin;

isAdminPresent = async (req, res, next) => {
    try {
        const email = req.admin.email;
        const isAdmin = await Admin.findOne({ where: { email: email } });
        if (!isAdmin) {
            return res.status(400).send({ message: "Admin is not present!" });
        };
        next();
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}
const present = {
    isAdminPresent: isAdminPresent
};
module.exports = present;