const { Op } = require('sequelize');
const db = require('../../../Models');
const LessonQuiz = db.lessonQuiz;
const Lesson = db.lesson;

exports.createLessonQuiz = async (req, res) => {
    try {
        const { quizQuestion, optionA, optionB, optionC, optionD, answer } = req.body;
        const lessonId = req.params.lessonId;
        const lesson = await Lesson.findOne({ where: { id: lessonId } });
        await LessonQuiz.create({
            quizQuestion: quizQuestion,
            optionA: optionA,
            optionB: optionB,
            optionC: optionC,
            optionD: optionD,
            courseId: lesson.courseId,
            sectionId: lesson.sectionId,
            lessonId: lessonId,
            answer: answer,
            adminId: req.admin.id
        });
        res.status(201).send({
            success: true,
            message: `Quiz added successfully!`
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

exports.getAllQuizByLessonId = async (req, res) => {
    try {
        const quiz = await LessonQuiz.findAll({
            where: {
                lessonId: req.params.lessonId
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "Quiz fetched successfully!",
            data: quiz
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.hardDeleteLessonQuiz = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const lessonQuiz = await LessonQuiz.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!lessonQuiz) {
            return res.status(400).send({
                success: false,
                message: "Quiz is not present!"
            });
        };
        await lessonQuiz.destroy({ force: true });
        res.status(200).send({
            success: true,
            message: `Lesson Quiz deleted seccessfully! ID!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.updateLessonQuiz = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const { quizQuestion, optionA, optionB, optionC, optionD, answer } = req.body;
        const lessonQuiz = await LessonQuiz.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!lessonQuiz) {
            return res.status(400).send({
                success: false,
                message: "Quiz is not present!"
            });
        };
        await lessonQuiz.update({
            ...lessonQuiz,
            quizQuestion: quizQuestion,
            optionA: optionA,
            optionB: optionB,
            optionC: optionC,
            optionD: optionD,
            answer: answer
        });
        res.status(200).send({
            success: true,
            message: `Lesson Quiz updated seccessfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};