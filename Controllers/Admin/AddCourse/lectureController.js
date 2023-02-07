const db = require('../../../Models');
const Lecture = db.lecture;
const { deleteFile } = require("../../../Util/deleteFile")

exports.createLecture = async (req, res) => {
    try {
        const { video, text, quiz, codeExample, customCode, richTextEditor, section_id } = req.body;
        await Lecture.create({
            video: video,
            file: req.file.path,
            text: text,
            quiz: quiz,
            codeExample: codeExample,
            customCode: customCode,
            richTextEditor: richTextEditor,
            section_id: section_id
        });
        res.status(201).send({ message: `Lecture added successfully!` });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.getLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findAll();
        res.status(200).send({
            message: "Lecture fetched successfully!",
            data: lecture
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};