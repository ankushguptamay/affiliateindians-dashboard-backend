const db = require('../../../Models');
const Member = db.member;

exports.create = async (req, res) => {
    try{
        console.log(req.body);
        const members = await Member.create({
            date: req.body.date,
            funnel: req.body.funnel,
            tag: req.body.tag,
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            lastTrainingDay: req.body.lastTrainingDay
            });
            res.status(201).send(`Member added with ID: ${members.id}`);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findAll = async (req, res) => {
    try{
        const members = await Member.findAll();
        res.status(200).send(members);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.delete = async (req, res) => {
    try{
        const id = req.params.id;
        const members = await Member.findOne({where: {id: id}});
        if (!members){
           console.log("error: Member is not present!");
        }
        members.destroy();
        res.status(200).send(`Member deleted of ID: ${id}`);
    }catch(err){
            console.log(err);
            res.status(500).send(err);
    }
};

exports.update = async (req, res) => {
    try{
        const id = req.params.id;
        const members = await Member.findOne({where: {id: id}});
        if (!members){
            console.log("error: Member is not present!");
        }
        members.update({
            date: req.body.date,
            funnel: req.body.funnel,
            tag: req.body.tag,
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            lastTrainingDay: req.body.lastTrainingDay
        });
        res.status(200).send(`Member modified of ID: ${id}`);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};