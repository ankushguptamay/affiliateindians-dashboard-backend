const { addCourse, section, lecture } = require('../../../Models');
const AddCourse = addCourse;
const { deleteFile, deleteMultiFile } = require("../../../Util/deleteFile")

exports.createAddCourse = async (req, res) => {
    try {
        const { title, subTitle, categories, authorName } = req.body;
        const addCourse = await AddCourse.create({
            title: title,
            subTitle: subTitle,
            authorName: authorName,
            authorImage: req.files.authorImage[0].path,
            categories: categories,
            courseImage: req.files.courseImage[0].path,
        });
        res.status(201).send({ message: `AddCourse added successfully! ID: ${addCourse.id}` });
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
                model: section,
                as: "curriculum",
                include: [{
                    model: lecture,
                    as: "lectures",
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

exports.deleteAddCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const addCourse = await AddCourse.findOne({ where: { id: id } });
        if (!addCourse) {
            return res.status(400).send({ message: "AddCourse is not present!" });
        };

        const sections = await section.findAll({ where: { addCourse_id: id }, attributes: ["id"] });
        const lectures = [];
        for (let i = 0; i < sections.length; i++) {
            lectures.push(await lecture.findAll({ where: { section_id: sections[i].id }, attributes: ["file"] }));
        }
        const fileArray = [];
        for (let i = 0; i < lectures.length; i++) {
            for (let j = 0; j < lectures[i].length; j++) {
                fileArray.push(lectures[i][j].file);
            }
        }

        deleteFile(addCourse.authorImage);
        deleteFile(addCourse.courseImage);
        await addCourse.destroy({ where: { id: id } });
        res.status(200).send({ message: `AddCourse deleted successfully! ID: ${id}` });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.updateAddCourse = async (req, res) => {
    try {
        let AuthorImage;
        let CourseImage;
        const id = req.params.id;
        const { title, subTitle, categories, authorName } = req.body;
        const addCourse = await AddCourse.findOne({ where: { id: id } });
        if (!addCourse) {
            return res.status(400).send({ message: "AddCourse is not present!" });
        }
        if (req.files.authorImage && req.files.courseImage) {
            deleteFile(addCourse.authorImage);
            deleteFile(addCourse.courseImage);
            AuthorImage = req.files.authorImage[0].path;
            CourseImage = req.files.courseImage[0].path;
        } else if (req.files.authorImage && !req.files.courseImage) {
            deleteFile(addCourse.authorImage);
            AuthorImage = req.files.authorImage[0].path;
            // CourseImage = addCourse.courseImage;
        } else if (!req.files.authorImage && req.files.courseImage) {
            deleteFile(addCourse.courseImage);
            CourseImage = req.files.courseImage[0].path;
            // AuthorImage = addCourse.authorImage;
        } // else {
        //     AuthorImage = addCourse.authorImage;
        //     CourseImage = addCourse.courseImage;
        // }
        await addCourse.update({
            title: title,
            subTitle: subTitle,
            authorName: authorName,
            authorImage: AuthorImage,
            categories: categories,
            courseImage: CourseImage,
        });
        res.status(200).send({ message: `AddCourse modified successfully! ID: ${id}` });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

// exports.deleteOnlyImages = async (req, res) => {
//     try {
//         let AuthorImage=null;
//         let CourseImage=null;
//         const id = req.params.id;
//         const addCourse = await AddCourse.findOne({ where: { id: id } });
//         if (!addCourse) {
//             return res.status(400).send({ message: "AddCourse is not present!" });
//         }
//         if (req.files.authorImage && req.files.courseImage) {
//             deleteFile(addCourse.authorImage);
//             deleteFile(addCourse.courseImage);
//             AuthorImage = req.files.authorImage[0].path;
//             CourseImage = req.files.courseImage[0].path;
//         } else if (req.file.authorImage && !req.files.courseImage) {
//             deleteFile(addCourse.authorImage);
//             AuthorImage = req.files.authorImage[0].path;
//             // CourseImage = addCourse.courseImage;
//         } else if (!req.file.authorImage && req.files.courseImage) {
//             deleteFile(addCourse.courseImage);
//             CourseImage = req.files.courseImage[0].path;
//             // AuthorImage = addCourse.authorImage;
//         } // else {
//         //     AuthorImage = addCourse.authorImage;
//         //     CourseImage = addCourse.courseImage;
//         // }
//         await AddCourse.update({
//             title: title,
//             subTitle: subTitle,
//             authorName: authorName,
//             authorImage: AuthorImage,
//             categories: categories,
//             courseImage: CourseImage,
//         });
//         res.status(200).send({ message: `AddCourse modified of ID: ${id}` });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send(err);
//     }
// };
