const { Lecture, Section } = require('../../../Models');
const { deleteMultiFile } = require("../../../Util/deleteFile")

exports.createCourseSection = async (req, res) => {
    try {
        const section = await Section.create({
            addCourse_id: req.body.addCourse_id
        });
        res.status(201).send({ message: `section added successfully! ID: ${section.id}` });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.getSection = async (req, res) => {
    try {
        const section = await Section.findAll({
            include: [{
                model: Lecture,
                as: "lectures"
            }]
        });
        res.status(200).send({
            message: "section fetched successfully!",
            data: section
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.deleteSection = async (req, res) => {
    try {
        const id = req.params.id;
        const section = await Section.findOne({ where: { id: id } });
        if (!section) {
            return res.status(400).send({ message: "Section is not present!" });
        };
        const lectures = await Lecture.findAll({ where: { section_id: id } });
        const fileArray = [];
        lectures.map((data) => {
            fileArray.push(data.file);
        });
        deleteMultiFile(fileArray);
        await section.destroy();
        res.status(200).send({ message: `Section deleted seccessfully! ID: ${id}` });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};