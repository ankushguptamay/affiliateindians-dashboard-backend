const { lecture, courseSection } = require('../../../Models');
const CourseSection = courseSection;


exports.createCourseSection = async (req, res) => {
    try {
        const section = await CourseSection.create({
            addCourse_id: req.body.addCourse_id
        });
        res.status(201).send({ message: `section added successfully! ID: ${section.id}` });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.getCourseSection = async (req, res) => {
    try {
        const section = await CourseSection.findAll({
            include: [{
                model: lecture
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