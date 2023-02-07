const { addCourse, courseSection, lecture } = require('../../../Models');
const AddCourse = addCourse;

exports.createAddCourse = async (req, res) => {
    try {
        console.log(req.files.authorImage);
        const { title, subTitle, categories, authorName, authorImage, courseImage, } = req.body;
        await AddCourse.create({
            title: title,
            subTitle: subTitle,
            authorName: authorName,
            authorImage: req.files.authorImage.path,
            categories: categories,
            courseImage: req.files.courseImage.path,
        });
        res.status(201).send({ message: `AddCourse added successfully!` });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.getAddCourse = async (req, res) => {
    try {
        const addCourse = await AddCourse.findAll({
            include: [{
                model: courseSection,
                as: "curriculum",
                include: [{
                    model: lecture,
                    as: "lectures"
                }]
            }]
        });
        res.status(200).send({
            message: "AddCourse fetched successfully!",
            data: addCourse
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};