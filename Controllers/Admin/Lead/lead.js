const db = require('../../../Models');
const Lead = db.lead;

exports.create = async (req, res) => {
    try{
        console.log(req.body);
        const leads = await Lead.create({
            date: req.body.date,
            funnel: req.body.funnel,
            tag: req.body.tag,
            name: req.body.name,
            email: req.body.email,
            });
            res.status(201).send(`Lead added with ID: ${leads.id}`);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findAll = async (req, res) => {
    try{
        const leads = await Lead.findAll();
        res.status(200).send(leads);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.delete = async (req, res) => {
    try{
        const id = req.params.id;
        const leads = await Lead.findOne({where: {id: id}});
        if (!leads){
           console.log("error: Lead is not present!");
        }
        leads.destroy();
        res.status(200).send(`Lead deleted of ID: ${id}`);
    }catch(err){
            console.log(err);
            res.status(500).send(err);
    }
};

exports.update = async (req, res) => {
    try{
        const id = req.params.id;
        const leads = await Lead.findOne({where: {id: id}});
        if (!leads){
            console.log("error: Lead is not present!");
        }
        leads.update({
            date: req.body.date,
            funnel: req.body.funnel,
            tag: req.body.tag,
            name: req.body.name,
            email: req.body.email,
        });
        res.status(200).send(`Lead modified of ID: ${id}`);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};