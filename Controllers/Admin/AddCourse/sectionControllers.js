const { Op } = require('sequelize');
const db = require('../../../Models');
const Section = db.section
const Lesson = db.lesson;
const LessonFile = db.lessonFile;
const LessonVideo = db.lessonVideo;
const VideoComment = db.videoComment;
const { deleteMultiFile } = require("../../../Util/deleteFile")

// createSection
// getAllSectionByCourseId for admin
// updateSection
// publicSection
// deleteSection

exports.createSection = async (req, res) => {
    try {
        await Section.create({
            courseId: req.body.courseId,
            sectionName: req.body.sectionName,
            adminId: req.admin.id
        });
        res.status(201).send({
            success: true,
            message: `section added successfully!`
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getAllSectionByCourseIdForAdmin = async (req, res) => {
    try {
        const section = await Section.findAll({
            where: {
                [Op.and]: [
                    { courseId: req.params.courseId }, { adminId: req.admin.id }
                ]
            },
            include: [{
                model: Lesson,
                as: "lessons",
                attributes: ["id", "lessonName"],
                order: [
                    ['createdAt', 'ASC']
                ]
            }],
            order: [
                ['createdAt', 'ASC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "section fetched successfully!",
            data: section
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

// exports.deleteSection = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const section = await Section.findOne({ where: { id: id } });
//         if (!section) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Section is not present!"
//             });
//         };
//         const lesson = await Lesson.findAll({ where: { sectionId: id } });
//         const commentFileArray = [];
//         const lessonFileArray = [];
//         const thumbnailArray = [];
//         if (lesson.length > 0) {
//             // delete associated video
//             for (let i = 0; i < lesson.length; i++) {
//                 const video = await LessonVideo.findAll({ lessonId: lesson[i].id });
//                 if (video.length > 0) {
//                     // delete video from bunny
//                     for (let i = 0; i < video.length; i++) {
//                         const deleteVideo = {
//                             method: "DELETE",
//                             url: `http://video.bunnycdn.com/library/${video[i].BUNNY_VIDEO_LIBRARY_ID}/videos/${video[i].Video_ID}`,
//                             headers: {
//                                 AccessKey: video[i].BUNNY_LIBRARY_API_KEY,
//                             }
//                         };

//                         await axios
//                             .request(deleteVideo)
//                             .then((response) => {
//                                 // console.log("delete: ", response.data);
//                             })
//                             .catch((error) => {
//                                 // console.log(error);
//                                 return res.status(400).send({
//                                     success: false,
//                                     message: "Delete request of video failed from bunny. try to delete again!",
//                                     bunnyMessage: error.message
//                                 });
//                             });
//                         thumbnailArray.push(video[i].Thumbnail_Path);
//                         const comment = await VideoComment.findAll({ where: { lessonVideoId: video[i].id } });
//                         for (let i = 0; i < comment.length; i++) {
//                             commentFileArray.push(comment[i].file_Path);
//                         }
//                     }
//                 }
//                 const lessonFile = await LessonFile.findAll({ where: { lessonId: lesson[i].id } });
//                 for (let i = 0; i < lessonFile.length; i++) {
//                     lessonFileArray.push(lessonFile[i].file_Path);
//                 }
//             }
//         }
//         // delete thumbnail
//         if (thumbnailArray.length > 0) {
//             deleteMultiFile(thumbnailArray);
//         }
//         // delete comment Files
//         if (commentFileArray.length > 0) {
//             deleteMultiFile(commentFileArray);
//         }
//         // delete lesson files
//         if (lessonFileArray.length > 0) {
//             deleteMultiFile(lessonFileArray);
//         }
//         await section.destroy();
//         res.status(200).send({
//             success: true,
//             message: `Section deleted seccessfully! ID: ${id}`
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send({
//             success: false,
//             err: err.message
//         });
//     }
// };

// exports.updateSection = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const section = await Section.findOne({
//             where: {
//                 [Op.and]: [
//                     { id: id }, { adminId: req.admin.id }
//                 ]
//             }
//         });
//         if (!section) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Section is not present!"
//             });
//         };
//         await section.update({
//             ...section,
//             sectionName: req.body.sectionName
//         });
//         res.status(200).send({
//             success: true,
//             message: `Section Name updated seccessfully!`
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send({
//             success: false,
//             err: err.message
//         });
//     }
// };

exports.publicSection = async (req, res) => {
    try {
        const id = req.params.id;
        const section = await Section.findOne({
            where: {
                [Op.and]: [
                    { id: id },
                    { adminId: req.admin.id }
                ]
            }
        });
        if (!section) {
            return res.status(400).send({
                success: false,
                message: "Section is not present!"
            });
        };
        await section.update({
            ...section,
            isPublic: true
        });
        res.status(200).send({
            success: true,
            message: `Section publiced seccessfully!`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};