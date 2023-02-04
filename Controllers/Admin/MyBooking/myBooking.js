const db = require('../../../Models');
const MyBooking = db.myBooking;

exports.create = async (req, res) => {
    try{
        console.log(req.body);
        const myBookings = await MyBooking.create({
            date: req.body.date,
            name: req.body.name,
            timing: req.body.timing,
            advisorName: req.body.advisorName
            });
            res.status(201).send(`My Booking added with ID: ${myBookings.id}`);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findAll = async (req, res) => {
    try{
        const myBookings = await MyBooking.findAll();
        res.status(200).send(myBookings);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.delete = async (req, res) => {
    try{
        const id = req.params.id;
        const myBookings = await MyBooking.findOne({where: {id: id}});
        if (!myBookings){
           console.log(`error: My Booking is not present with this id: ${id}!`);
        }
        myBookings.destroy();
        res.status(200).send(`My Booking deleted of ID: ${id}`);
    }catch(err){
            console.log(err);
            res.status(500).send(err);
    }
};

exports.update = async (req, res) => {
    try{
        const id = req.params.id;
        const myBookings = await MyBooking.findOne({where: {id: id}});
        if (!myBookings){
            console.log(`error: My Booking is not present with this id: ${id}!`);
        }
        myBookings.update({
            date: req.body.date,
            name: req.body.name,
            timing: req.body.timing,
            advisorName: req.body.advisorName
        });
        res.status(200).send(`My Booking modified of ID: ${id}`);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};