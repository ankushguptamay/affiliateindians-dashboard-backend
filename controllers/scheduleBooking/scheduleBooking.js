const db = require('../../models');
const ScheduleBooking = db.scheduleBooking;

exports.create = async (req, res) => {
    try{
        console.log(req.body);
        const scheduleBookings = await ScheduleBooking.create({
            date: req.body.date,
            name: req.body.name,
            timing: req.body.timing,
            advisorName: req.body.advisorName
            });
            res.status(201).send(`Schedule Booking added with ID: ${scheduleBookings.id}`);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findAll = async (req, res) => {
    try{
        const scheduleBookings = await ScheduleBooking.findAll();
        res.status(200).send(scheduleBookings);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.delete = async (req, res) => {
    try{
        const id = req.params.id;
        const scheduleBookings = await ScheduleBooking.findOne({where: {id: id}});
        if (!scheduleBookings){
           console.log(`error: Schedule Booking is not present with this id: ${id}!`);
        }
        scheduleBookings.destroy();
        res.status(200).send(`Schedule Booking deleted of ID: ${id}`);
    }catch(err){
            console.log(err);
            res.status(500).send(err);
    }
};

exports.update = async (req, res) => {
    try{
        const id = req.params.id;
        const scheduleBookings = await ScheduleBooking.findOne({where: {id: id}});
        if (!scheduleBookings){
            console.log(`error: Schedule Booking is not present with this id: ${id}!`);
        }
        scheduleBookings.update({
            date: req.body.date,
            name: req.body.name,
            timing: req.body.timing,
            advisorName: req.body.advisorName
        });
        res.status(200).send(`Schedule Booking modified of ID: ${id}`);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};