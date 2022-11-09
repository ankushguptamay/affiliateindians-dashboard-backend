const db = require('../models');
const Advisor = db.user;

exports.create = async (req, res) => {
    try{
        console.log(req.body);
        const advisor = await Advisor.create({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            image: req.body.image
            });
            res.status(201).send(`Advisor added with ID: ${advisor.id}`);
    }
    catch(error){
        console.log(error);
        res.status(500).send(error);
    }
};

exports.findAll = async (req, res) => {
    try{
        const advisor = await Advisor.findAll();
        res.status(200).send(advisor);
    }catch(error){
        console.log(error);
        res.status(500).send(error);
    }
};