const db = require('../models');
const Advisor = db.advisor;

exports.create = async (req, res) => {
    try{
        console.log(req.body);
        const advisors = await Advisor.create({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            image: req.body.image
            });
            res.status(201).send(`Advisor added with ID: ${advisors.id}`);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findAll = async (req, res) => {
    try{
        const advisors = await Advisor.findAll();
        res.status(200).send(advisors);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.delete = async (req, res) => {
    try{
        const id = req.params.id;
        const advisors = await Advisor.findOne({where: {id: id}});
        if (!advisors){
           console.log("error: Advisor is not present!");
        }
        advisors.destroy();
        res.status(200).send(`Advisor deleted of ID: ${id}`);
    }catch(err){
            console.log(err);
            res.status(500).send(err);
    }
};

exports.update = async (req, res) => {
    try{
        const id = req.params.id;
        const advisors = await Advisor.findOne({where: {id: id}});
        if (!advisors){
            console.log("error: Advisor is not present!");
        }
        advisors.update({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            image: req.body.image
        });
        res.status(200).send(`Advisor modified of ID: ${id}`);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};