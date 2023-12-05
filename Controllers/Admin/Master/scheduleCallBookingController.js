const db = require('../../../Models');
const ScheduleCallBooking = db.scheduleCallBooking;
const User = db.user;
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
        // checkedTimes admin want to hold or not available PAUSED
        // unCheckedTimes admin is available UNPAUSED
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
                createrAvailablity: "PAUSED",
                adminId: req.admin.id
            });
        }
        for (let i = 0; i < unCheckedTimes.length; i++) {
            await ScheduleCallBooking.create({
                month: month,
                date: date,
                timing: unCheckedTimes[i],
                createrAvailablity: "UNPAUSED",
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
        const todayDate = JSON.stringify(new Date());
        const date = (req.query.date) ? req.query.date : `${todayDate.slice(1, 11)}`;
        const condition = {
            adminId: req.admin.id,
            createrAvailablity: "UNPAUSED",
            date: date
        };
        const unPausedSchedule = await ScheduleCallBooking.findAll({
            where: condition
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
        const todayDate = JSON.stringify(new Date());
        const date = (req.query.date) ? req.query.date : `${todayDate.slice(1, 11)}`;
        const condition = {
            adminId: req.admin.id,
            createrAvailablity: "PAUSED",
            date: date
        };
        const pausedSchedule = await ScheduleCallBooking.findAll({
            where: condition
        });
        res.status(201).send({
            success: true,
            message: `${date},s paused schedule booking fetched successfully!`,
            data: pausedSchedule
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
        const user = await User.findOne({
            where: {
                id: req.user.id
            }
        });
        // book schedule before 1 hours
        const time = isSchedule.timing;
        const scheduleTime = `${isSchedule.date}T${(isSchedule.timing).slice(1, 6)}:00`
        // date validation is not done
        // Book schedule
        await isSchedule.update({
            ...isSchedule,
            userName: user.name,
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
        const adminId = req.query.adminId;
        // If current time is greater then 16:30 then user will show tomorrow schedule
        const todayDate = JSON.stringify(new Date());
        const tomorrowDate = JSON.stringify(new Date((new Date).getTime() + (1 * 24 * 60 * 60 * 1000)));
        const ISTCurrentDate = (new Date).getTime() + (330 * 60 * 1000);
        const ISTFourAndHalfDate = new Date(`${todayDate.slice(1, 11)}T16:30:00`).getTime() + (330 * 60 * 1000);
        let date = (req.query.date) ? req.query.date : `${todayDate.slice(1, 11)}`;
        if (parseInt(ISTCurrentDate) > parseInt(ISTFourAndHalfDate)) {
            date = (req.query.date) ? req.query.date : `${tomorrowDate.slice(1, 11)}`;
        }
        // find schedule
        const schedule = await ScheduleCallBooking.findAll({
            where: {
                adminId: adminId,
                date: date,
                createrAvailablity: "UNPAUSED",
            },
            order: [
                ['createdAt', 'ASC']
            ]
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

// 4:30