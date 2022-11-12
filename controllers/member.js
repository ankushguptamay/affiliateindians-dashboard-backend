const db = require('../models');
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
            res.status(201).send(`Members added with ID: ${members.id}`);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};