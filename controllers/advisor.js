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
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findAll = async (req, res) => {
    try{
        const advisor = await Advisor.findAll();
        res.status(200).send(advisor);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.delete = async (req, res) => {
    try{
        const id = req.params.id;
        const advisor = await Advisor.findOne({where: {id: id}});
        if (!advisor){
           console.log("err");
        }
        advisor.destroy();
        res.status(200).send(`Advisor deleted with ID: ${id}`);
    }catch(err){
            console.log(err);
            res.status(500).send(err);
    }
};