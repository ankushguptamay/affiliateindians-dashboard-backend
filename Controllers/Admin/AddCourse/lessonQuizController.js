const db = require('../../../Models');
const LessonQuiz = db.lessonQuiz;

exports.createLessonQuiz = async (req, res) => {
    try {
        const { quizQuestion, optionA, optionB, optionC, optionD, courseId, sectionId } = req.body;
        const lessonId = req.params.lessonId;
        await LessonQuiz.create({
            quizQuestion: quizQuestion,
            optionA: optionA,
            optionB: optionB,
            optionC: optionC,
            optionD: optionD,
            courseId: courseId,
            sectionId: sectionId,
            lessonId: lessonId,
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

exports.deleteLessonQuiz = async (req, res) => {
    try {
        const id = req.params.id;
        const lessonQuiz = await LessonQuiz.findOne({
            where: {
                id: id,
                adminId: req.admin.id
            }
        });
        if (!lessonQuiz) {
            return res.status(400).send({
                success: false,
                message: "Quiz is not present!"
            });
        };
        await lessonQuiz.destroy();
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
        const { quizQuestion, optionA, optionB, optionC, optionD } = req.body;
        const lessonQuiz = await LessonQuiz.findOne({
            where: {
                id: id,
                adminId: req.admin.id
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
            optionD: optionD
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