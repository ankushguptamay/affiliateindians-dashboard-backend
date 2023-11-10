const db = require('../Models');
const Admin = db.admin;
const User = db.user;

exports.isAdmin = async (req, res, next) => {
    try {
        const adminTag = (req.admin.adminTag).toUpperCase();
        if (adminTag !== "ADMIN") {
            return res.status(400).send({ message: "Unauthorized!" });
        }
        const email = req.admin.email;
        const id = req.admin.id;
        const isAdmin = await Admin.findOne({
            where: {
                id: id,
                email: email,
                adminTag: "ADMIN",
                termAndConditionAccepted: true
            }
        });
        if (!isAdmin) {
            return res.status(400).send({ message: "Admin is not present!" });
        };
        next();
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

exports.isSuperAdmin = async (req, res, next) => {
    try {
        const adminTag = (req.admin.adminTag).toUpperCase();
        if (adminTag !== "SUPERADMIN") {
            return res.status(400).send({ message: "Unauthorized!" });
        }
        const email = req.admin.email;
        const id = req.admin.id;
        const isAdmin = await Admin.findOne({
            where: {
                id: id,
                email: email,
                adminTag: "SUPERADMIN"
            }
        });
        if (!isAdmin) {
            return res.status(400).send({ message: "Super Admin is not present!" });
        };
        next();
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

exports.isUser = async (req, res, next) => {
    try {
        const email = req.user.email;
        const id = req.user.id;
        const isUser = await User.findOne({
            where: {
                id: id,
                email: email,
                termAndConditionAccepted: true
            }
        });
        if (!isUser) {
            return res.status(400).send({ message: "User is not present!" });
        };
        next();
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

exports.isUserForPayment = async (req, res, next) => {
    try {
        if (req.user) {
            const email = req.user.email;
            const id = req.user.id;
            const isUser = await User.findOne({
                where: {
                    id: id,
                    email: email,
                    termAndConditionAccepted: true
                }
            });
            if (!isUser) {
                return res.status(400).send({ message: "User is not present!" });
            };
        }
        next();
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}