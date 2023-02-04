const db = require('../../../Models');
const EWallet = db.eWallet;

exports.create = async (req, res) => {
    try{
        console.log(req.body);
        const eWallets = await EWallet.create({
            redeemDate: req.body.redeemDate,
            name: req.body.name,
            amount: req.body.amount,
            action: req.body.action
            });
            res.status(201).send(`eWallet added with ID: ${eWallets.id}`);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findAll = async (req, res) => {
    try{
        const eWallets = await EWallet.findAll();
        res.status(200).send(eWallets);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.delete = async (req, res) => {
    try{
        const id = req.params.id;
        const eWallets = await EWallet.findOne({where: {id: id}});
        if (!eWallets){
           console.log(`error: eWallet is not present with this id: ${id}!`);
        }
        eWallets.destroy();
        res.status(200).send(`eWallet deleted of ID: ${id}`);
    }catch(err){
            console.log(err);
            res.status(500).send(err);
    }
};

exports.update = async (req, res) => {
    try{
        const id = req.params.id;
        const eWallets = await EWallet.findOne({where: {id: id}});
        if (!eWallets){
            console.log(`error: eWallet is not present with this id: ${id}!`);
        }
        eWallets.update({
            redeemDate: req.body.redeemDate,
            name: req.body.name,
            amount: req.body.amount,
            action: req.body.action
        });
        res.status(200).send(`eWallet modified of ID: ${id}`);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};