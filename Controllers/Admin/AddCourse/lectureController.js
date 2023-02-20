const db = require('../../../Models');
const Lecture = db.lecture;
const { deleteFile } = require("../../../Util/deleteFile")

exports.createLecture = async (req, res) => {
    try {
        const { video, text, quiz, codeExample, customCode, richTextEditor, section_id } = req.body;
        const lecture = await Lecture.create({
            video: video,
            file: req.file.path,
            text: text,
            quiz: quiz,
            codeExample: codeExample,
            customCode: customCode,
            richTextEditor: richTextEditor,
            section_id: section_id
        });
        res.status(201).send({ message: `Lecture added successfully! ID: ${lecture.id}` });
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

exports.deleteLecture = async (req, res) => {
    try {
        const id = req.params.id;
        const lecture = await Lecture.findOne({ where: { id: id } });
        if (!lecture) {
            return res.status(400).send({ message: "Lecture is not present!" });
        };
        await lecture.destroy();
        res.status(200).send({
            message: `Lecture deleted successfully! Id: ${id}`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.updateLecture = async (req, res) => {
    try {
        let File;
        const id = req.params.id;
        const { video, text, quiz, codeExample, customCode, richTextEditor, section_id } = req.body;
        const lecture = await Lecture.findOne({ where: { id: id } });
        if (!lecture) {
            return res.status(400).send({ message: "Lecture is not present!" });
        }
        if (req.file) {
            if (lecture.file) {
                deleteFile(lecture.file);
                File = req.file.path;
            } else {
                File = req.file.path;
            }
        }
        await lecture.update({
            video: video,
            file: File,
            text: text,
            quiz: quiz,
            codeExample: codeExample,
            customCode: customCode,
            richTextEditor: richTextEditor,
            section_id: section_id
        });
        res.status(200).send({ message: `Lecture modified successfully! ID: ${id}` });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.deleteOnlyFile = async (req, res) => {
    try {
        let File = null;
        const id = req.params.id;
        const lecture = await Lecture.findOne({ where: { id: id } });
        if (!lecture) {
            return res.status(400).send({ message: "Lecture is not present!" });
        }
        deleteFile(lecture.file);
        await lecture.update({
            ...req.body,
            file: File
        });
        res.status(200).send({ message: `Lecture File deleted successfully! ID: ${id}` });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};