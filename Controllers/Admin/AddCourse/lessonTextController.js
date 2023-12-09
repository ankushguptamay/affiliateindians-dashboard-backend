const { Op } = require('sequelize');
const db = require('../../../Models');
const LessonText = db.lessonText;
const Lesson = db.lesson;
const { lessonTextValidation } = require("../../../Middlewares/Validate/validateCourse");

exports.addLessonText = async (req, res) => {
    try {
        // Validate Body
        const { error } = lessonTextValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const lessonId = req.params.lessonId;
        const lesson = await Lesson.findOne({ where: { id: lessonId } });
        const { text, textType } = req.body;
        const textTypeUpperCase = textType.toUpperCase();
        if (textTypeUpperCase === 'RICHTEXT' || textTypeUpperCase === 'CUSTOMCODE' || textTypeUpperCase === 'CODEEXAMPLE') {
            await LessonText.create({
                courseId: lesson.courseId,
                sectionId: lesson.sectionId,
                lessonId: lessonId,
                textType: textTypeUpperCase,
                text: text,
                adminId: req.admin.id
            });
            res.status(201).send({
                success: true,
                message: `${textTypeUpperCase} added successfully!`
            });
        } else {
            res.status(403).send({
                success: false,
                message: `Text Type should be matched!`
            });
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.updateLessonText = async (req, res) => {
    try {
        // Validate Body
        const { error } = lessonTextValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const textId = req.params.id;
        const { text, textType } = req.body;
        const lessonText = await LessonText.findOne({
            where: {
                id: textId
            }
        });
        if (!lessonText) {
            return res.status(400).send({
                success: false,
                message: `Text is not present!`
            });
        }
        const textTypeUpperCase = textType.toUpperCase();
        if (textTypeUpperCase !== lessonText.textType) {
            if (textTypeUpperCase !== 'RICHTEXT' || textTypeUpperCase !== 'CUSTOMCODE' || textTypeUpperCase !== 'CODEEXAMPLE') {
                return res.status(403).send({
                    success: false,
                    message: `Text Type should be matched!`
                });
            }
        }
        await lessonText.update({
            ...lessonText,
            text: text,
            textType: textType
        });
        res.status(201).send({
            success: true,
            message: `${textTypeUpperCase} updated successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.hardDeleteLessonText = async (req, res) => {
    try {
        const textId = req.params.id;
        const lessonText = await LessonText.findOne({
            where: {
                id: textId
            }
        });
        if (!lessonText) {
            return res.status(400).send({
                success: false,
                message: `Text is not present!`
            });
        }
        await lessonText.destroy({
            force: true
        });
        res.status(201).send({
            success: true,
            message: `${lessonText.textType} deleted successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};