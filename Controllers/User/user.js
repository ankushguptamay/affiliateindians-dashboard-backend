const db = require('../../Models');
const User = db.user;

exports.create = async (req, res) => {
    try {
        // console.log(req.body);
        const users = await User.create({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            pinCode: req.body.pinCode
        });
        res.status(201).send({
            success: true,
            message: `User added successfully!`
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findAll = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).send({
            success: true,
            message: `User fetched successfully!`,
            data: users
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const users = await User.findOne({ where: { id: id } });
        if (!users) {
            return res.status(400).send({
                success: false,
                message: "User is not present"
            })
        }
        users.destroy();
        res.status(200).send({
            success: true,
            message: `User deleted successfully!`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const users = await User.findOne({ where: { id: id } });
        if (!users) {
            return res.status(400).send({
                success: false,
                message: "User is not present"
            })
        }
        users.update({
            name: req.body.name,
            // email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            address: req.body.address,
            // city: req.body.city,
            // state: req.body.state,
            // country: req.body.country,
            pinCode: req.body.pinCode
        });
        res.status(200).send({
            success: true,
            message: `User updated successfully!`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
