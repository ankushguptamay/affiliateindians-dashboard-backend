
const db = require('../models');
const User = db.user;

exports.create = async (req, res) => {
    try{
        console.log(req.body);
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
            res.status(201).send(`User added with ID: ${users.id}`);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findAll = async (req, res) => {
    try{
        const users = await User.findAll();
        res.status(200).send(users);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.delete = async (req, res) => {
    try{
        const id = req.params.id;
        const users = await User.findOne({where: {id: id}});
        if (!users){
           console.log("error");
        }
        users.destroy();
        res.status(200).send(`User deleted of ID: ${id}`);
    }catch(err){
            console.log(err);
            res.status(500).send(err);
    }
};

exports.update = async (req, res) => {
    try{
        const id = req.params.id;
        const users = await User.findOne({where: {id: id}});
        if (!users){
            console.log("error");
        }
        users.update({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            pinCode: req.body.pinCode
        });
        res.status(200).send(`User modified of ID: ${id}`);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};
