
const db = require('../models');
const User = db.user;

exports.create = async (req, res) => {
    try{
        console.log(req.body);
        const users = await User.create({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.contactNumber,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            pinCode: req.body.pinCode
            });
            res.status(201).send(`User added with ID: ${users.id}`);
    }
    catch(error){
        console.log(error);
        res.status(500).send(error);
    }
};

exports.findAll = async (req, res) => {
    try{
        const users = await User.findAll();
        res.status(200).send(users);
    }catch(error){
        console.log(error);
        res.status(500).send(error);
    }
};
