const db = require('../../../Models');
const ScheduleCallBooking = db.scheduleCallBooking;
const { Op } = require('sequelize');
const { scheduleBookingValidation } = require("../../../Middlewares/Validate/masterValidate");

exports.createSchedule = async (req, res) => {
    try {
        // Validate Body
        const { error } = scheduleBookingValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { month, date, checkedTimes, unCheckedTimes } = req.body;
        // 7 days validation
        const date1 = JSON.stringify(new Date());
        const date2 = JSON.stringify(new Date((new Date).getTime() + (1 * 24 * 60 * 60 * 1000)));
        const date3 = JSON.stringify(new Date((new Date).getTime() + (2 * 24 * 60 * 60 * 1000)));
        const date4 = JSON.stringify(new Date((new Date).getTime() + (3 * 24 * 60 * 60 * 1000)));
        const date5 = JSON.stringify(new Date((new Date).getTime() + (4 * 24 * 60 * 60 * 1000)));
        const date6 = JSON.stringify(new Date((new Date).getTime() + (5 * 24 * 60 * 60 * 1000)));
        const date7 = JSON.stringify(new Date((new Date).getTime() + (6 * 24 * 60 * 60 * 1000)));
        const array = [`${date1.slice(1, 11)}`, `${date2.slice(1, 11)}`, `${date3.slice(1, 11)}`, `${date4.slice(1, 11)}`,
        `${date5.slice(1, 11)}`, `${date6.slice(1, 11)}`, `${date7.slice(1, 11)}`]
        if (array.indexOf(date) === -1) {
            return res.status(400).send({
                success: false,
                message: "Can't create more then seven days slote!"
            });
        }
        for (let i = 0; i < checkedTimes.length; i++) {
            await ScheduleCallBooking.create({
                month: month,
                date: date,
                timing: checkedTimes[i],
                createrAvailablity: "UNPAUSED",
                adminId: req.admin.id
            });
        }
        for (let i = 0; i < unCheckedTimes.length; i++) {
            await ScheduleCallBooking.create({
                month: month,
                date: date,
                timing: checkedTimes[i],
                createrAvailablity: "PAUSED",
                adminId: req.admin.id
            });
        }
        res.status(201).send({
            success: true,
            message: "Schedule booking created successfully!"
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getUnPausedScheduleForAdmin = async (req, res) => {
    try {
        const date = req.query.date;
        const unPausedSchedule = await ScheduleCallBooking.findAll({
            where: {
                adminId: req.admin.id,
                createrAvailablity: "UNPAUSED"
            }
        });
        res.status(201).send({
            success: true,
            message: `${date},s unpaused schedule booking fetched successfully!`,
            data: unPausedSchedule
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getPausedScheduleForAdmin = async (req, res) => {
    try {
        const date = req.query.date;
        const unPausedSchedule = await ScheduleCallBooking.findAll({
            where: {
                adminId: req.admin.id,
                createrAvailablity: "PAUSED"
            }
        });
        res.status(201).send({
            success: true,
            message: `${date},s paused schedule booking fetched successfully!`,
            data: unPausedSchedule
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.bookScheduleByUser = async (req, res) => {
    try {
        const scheduleId = req.params.id;
        // find schedule
        const isSchedule = await ScheduleCallBooking.findOne({
            where: {
                id: scheduleId
            }
        });
        if (!isSchedule) {
            return res.status(400).send({
                success: false,
                message: "Schedule is not present!"
            });
        }
        // is paused
        if (isSchedule.createrAvailablity === "PAUSED") {
            return res.status(400).send({
                success: false,
                message: "Advisor is not available on this schedule!"
            });
        }
        // is booked
        if (isSchedule.bookingStatus === "BOOKED") {
            return res.status(400).send({
                success: false,
                message: "This schedule has already booked! Please choose other one!"
            });
        }
        // date validation is not done
        // Book schedule
        await isSchedule.update({
            ...isSchedule,
            bookingStatus: "BOOKED",
            userId: req.user.id
        });
        res.status(201).send({
            success: true,
            message: "Schedule booked successfully!"
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getScheduleForUser = async (req, res) => {
    try {
        const adminId = req.body.adminId;
        const todayDate = JSON.stringify(new Date());
        const date = (req.body.date) ? req.body.date : `${todayDate.slice(1, 11)}`;
        // find schedule
        const schedule = await ScheduleCallBooking.findAll({
            where: {
                adminId: adminId,
                date: date,
                createrAvailablity: "UNPAUSED",
            }
        });
        res.status(201).send({
            success: true,
            message: "Schedule fetched successfully!",
            data: schedule
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};