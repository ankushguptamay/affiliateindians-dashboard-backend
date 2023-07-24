const db = require('../../../Models');
const LecturesQuiz = db.lectureQuiz;

exports.createLectureQuiz = async (req, res) => {
    try {
        const { quizQuestion, optionA, optionB, optionC, optionD, courseId, sectionId } = req.body;
        const lectureId = req.params.lectureId;
        await LecturesQuiz.create({
            quizQuestion: quizQuestion,
            optionA: optionA,
            optionB: optionB,
            optionC: optionC,
            optionD: optionD,
            courseId: courseId,
            sectionId: sectionId,
            lectureId: lectureId,
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

exports.getAllQuizByLectureId = async (req, res) => {
    try {
        const quiz = await LecturesQuiz.findAll({
            where: {
                [Op.and]: [
                    { lectureId: req.params.lectureId }
                ]
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

exports.deleteLectureQuiz = async (req, res) => {
    try {
        const id = req.params.id;
        const lectureQuiz = await LecturesQuiz.findOne({ where: { id: id } });
        if (!lectureQuiz) {
            return res.status(400).send({
                success: false,
                message: "Quiz is not present!"
            });
        };
        await lectureQuiz.destroy();
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

exports.updateLectureQuiz = async (req, res) => {
    try {
        const id = req.params.id;
        const { quizQuestion, optionA, optionB, optionC, optionD } = req.body;
        const lectureQuiz = await LecturesQuiz.findOne({ where: { id: id } });
        if (!lectureQuiz) {
            return res.status(400).send({
                success: false,
                message: "Quiz is not present!"
            });
        };
        await lectureQuiz.update({
            ...lectureQuiz,
            quizQuestion: quizQuestion,
            optionA: optionA,
            optionB: optionB,
            optionC: optionC,
            optionD: optionD
        });
        res.status(200).send({
            success: true,
            message: `Lecture Quiz updated seccessfully!`
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};