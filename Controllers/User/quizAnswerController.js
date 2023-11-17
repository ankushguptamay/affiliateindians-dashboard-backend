const db = require('../../Models');
const User = db.user;
const Quiz_Answer = db.quizAnswer;
const Quiz = db.lessonQuiz;
const { Op } = require('sequelize');
const { submitQuizAnswer } = require("../../Middlewares/Validate/validateCourse");

const checkAnswer = async (adminAnswer, userAnswer) => {
    const compareArrays = (a, b) =>
        a.length === b.length &&
        a.every((element, index) => element === b[index]);

    let wrongAnswer = 0, rigthAnswer = 0, attempt = 0;
    for (let i = 0; i < adminAnswer.length; i++) {
        const quizId = adminAnswer[i].id;
        const sortAdminaAnswer = (adminAnswer[i].answer).sort();
        for (let j = 0; j < userAnswer.length; j++) {
            if (quizId === userAnswer[j].quizId) {
                attempt = attempt + 1;
                const sortUserAnswer = (userAnswer[j].answer).sort();
                const check = compareArrays(sortAdminaAnswer, sortUserAnswer);
                if (check === true) {
                    rigthAnswer = rigthAnswer + 1;
                } else {
                    wrongAnswer = wrongAnswer + 1;
                }
            }
        }
    }
    const unAttempt = adminAnswer.length - userAnswer.length;
    const response = {
        wrongAnswer: wrongAnswer,
        rigthAnswer: rigthAnswer,
        unAttempt: unAttempt,
        attempt: attempt
    }
    return response;
}

exports.submitAnswer = async (req, res) => {
    try {
        // const answers = [
        //     {
        //         quizId: "nof0ie84",
        //         answer: ["optionA", "optionB"]
        //     }, {
        //         quizId: "nof0ie84",
        //         answer: ["optionA", "optionB"]
        //     }
        // ]
        // Validate Body
        const { error } = submitQuizAnswer(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const userId = req.user.id;
        const { answers } = req.body;
        let submitAnswer = 0;
        for (let i = 0; i < answers.length; i++) {
            const isSubmit = await Quiz_Answer.findOne({
                where: {
                    quizId: answers[i].quizId,
                    userId: userId
                },
                paranoid: false
            });
            const quiz = await Quiz.findOne({
                where: {
                    id: answers[i].quizId
                }
            });
            if (!isSubmit) {
                await Quiz_Answer.create({
                    quizId: answers[i].quizId,
                    userId: userId,
                    answer: answers[i].answer,
                    courseId: quiz.courseId,
                    sectionId: quiz.sectionId,
                    lessonId: quiz.lessonId
                });
                submitAnswer = submitAnswer + 1;
            }
        }
        res.status(201).send({
            success: true,
            message: `${submitAnswer} answer submited successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.checkResultbyLessonForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const lessonId = req.params.id;

        const quizAnswerByUser = await Quiz_Answer.findAll({
            where: {
                lessonId: lessonId,
                userId: userId
            }
        });
        const quizAnswerByAdmin = await Quiz.findAll({
            where: {
                lessonId: lessonId
            }
        });
        const response = await checkAnswer(quizAnswerByAdmin, quizAnswerByUser);
        res.status(201).send({
            success: true,
            message: `Quiz checked successfully!`,
            data: response
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.checkResultbySectionForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const sectionId = req.params.id;

        const quizAnswerByUser = await Quiz_Answer.findAll({
            where: {
                sectionId: sectionId,
                userId: userId
            }
        });
        const quizAnswerByAdmin = await Quiz.findAll({
            where: {
                sectionId: sectionId
            }
        });
        const response = await checkAnswer(quizAnswerByAdmin, quizAnswerByUser);
        res.status(201).send({
            success: true,
            message: `Quiz checked successfully!`,
            data: response
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.checkResultbyCourseForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id;

        const quizAnswerByUser = await Quiz_Answer.findAll({
            where: {
                courseId: courseId,
                userId: userId
            }
        });
        const quizAnswerByAdmin = await Quiz.findAll({
            where: {
                courseId: courseId
            }
        });
        const response = await checkAnswer(quizAnswerByAdmin, quizAnswerByUser);
        res.status(201).send({
            success: true,
            message: `Quiz checked successfully!`,
            data: response
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};