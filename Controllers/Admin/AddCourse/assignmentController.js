const { Op } = require('sequelize');
const db = require('../../../Models');
const Assignment = db.assignment;
const AssignmentAnswer = db.assignmentAnswer;
const Lesson = db.lesson;
const { assignmentValidation, assignmentAnswerValidation } = require("../../../Middlewares/Validate/validateCourse");

exports.createAssignment = async (req, res) => {
    try {
        // Validate Body
        const { error } = assignmentValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const lessonId = req.params.id;
        const lesson = await Lesson.findOne({ where: { id: lessonId } });
        const { question, assignmentType } = req.body;
        const assignmentTypeUpperCase = assignmentType.toUpperCase();
        if (assignmentTypeUpperCase === 'SCHEDULE CALL' || assignmentTypeUpperCase === 'ANSWER' || assignmentTypeUpperCase === 'INFORMATION' || assignmentTypeUpperCase === 'AFFILIATE LINK') {
            await Assignment.create({
                courseId: lesson.courseId,
                sectionId: lesson.sectionId,
                lessonId: lessonId,
                assignmentType: assignmentTypeUpperCase,
                question: question,
                adminId: req.admin.id
            });
            res.status(201).send({
                success: true,
                message: `Assignment created successfully!`
            });
        } else {
            res.status(403).send({
                success: false,
                message: `Assignment Type should be matched!`
            });
        }
    }
    catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.submitAssignmentAnswer = async (req, res) => {
    try {
        // Validate Body
        const { error } = assignmentAnswerValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const assignmentId = req.params.id;
        const assignment = await Assignment.findOne({ where: { id: assignmentId } });
        const { answer } = req.body;

        await AssignmentAnswer.create({
            courseId: assignment.courseId,
            sectionId: assignment.sectionId,
            lessonId: assignment.lessonId,
            answer: answer,
            assignmentId: assignmentId,
            userId: req.user.id
        });
        res.status(201).send({
            success: true,
            message: `Assignment Answer submited successfully!`
        });
    }
    catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getAssignmentAnswerByLessonIdForAdmin = async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.body.userId;
        if (!userId) {
            return res.status(403).send({
                success: false,
                message: `User Id is missing!`
            });
        }
        const answer = await AssignmentAnswer.findAll({
            where: {
                lessonId: lessonId,
                userId: userId
            },
            include: [{
                model: Assignment,
                as: "assignment"
            }]
        });
        res.status(201).send({
            success: true,
            message: `Assignment Answer fetched successfully!`,
            data: answer
        });
    }
    catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getAssignmentAnswerByLessonIdForUser = async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user.id;
        const answer = await AssignmentAnswer.findAll({
            where: {
                lessonId: lessonId,
                userId: userId
            },
            include: [{
                model: Assignment,
                as: "assignment"
            }]
        });
        res.status(201).send({
            success: true,
            message: `Assignment Answer fetched successfully!`,
            data: answer
        });
    }
    catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.hardDeleteAssignment = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        // find Assignment
        const assignment = await Assignment.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!assignment) {
            return res.status(400).send({
                success: false,
                message: "Assignment is not present!"
            });
        };
        // FindAll Assignment Answer
        const assignmentAnswer = await AssignmentAnswer.findAll({
            where: {
                assignmentId: id,
            }
        });
        if (assignmentAnswer.length > 0) {
            await assignmentAnswer.destroy({ force: true });
        }
        // Hard delete assignment
        await assignment.destroy({ force: true });
        res.status(200).send({
            success: true,
            message: `Assignment deleted seccessfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};