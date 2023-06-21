const { AddCourse, Lecture } = require('../../../Models');
const { deleteFile } = require("../../../Util/deleteFile");
const axios = require('axios');

exports.createLecture = async (req, res) => {
    try {
        const { videoName, text, quiz, codeExample, customCode, richTextEditor, section_id, addCourse_id } = req.body;
        const addCourse = await AddCourse.findOne({
            where: {
                id: addCourse_id
            }
        });
        // upload video to bunny
        let video_id;
        const optionsToCreateVideo = {
            method: "POST",
            url: `http://video.bunnycdn.com/library/${addCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/`,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                AccessKey: addCourse.BUNNY_LIBRARY_API_KEY,
            },
            data: JSON.stringify({ title: videoName }),
        };

        await axios
            .request(optionsToCreateVideo)
            .then((response) => {
                video_id = response.data.guid;
                const video = req.file.buffer;
                axios.put(`http://video.bunnycdn.com/library/${addCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/${video_id}`,
                    video, {
                    headers: {
                        Accept: "application/json",
                        'Content-Type': 'application/json',
                        AccessKey: addCourse.BUNNY_LIBRARY_API_KEY,
                    }
                }
                ).then(result => {
                    // console.log("result: ", result.data);
                }, (error) => {
                    // console.log("error: ", error);
                })
            })
            .catch((error) => {
                console.log(error);
                return res.status(400).json({
                    success: false,
                    error: "failed to add lecture!"
                });
            });
        // add in databse
        const lecture = await Lecture.create({
            videoName: videoName,
            text: text,
            quiz: quiz,
            codeExample: codeExample,
            customCode: customCode,
            richTextEditor: richTextEditor,
            section_id: section_id,
            addCourse_id: addCourse_id,
            Video_ID: video_id,
            Direct_Play_URL: `https://iframe.mediadelivery.net/play/${addCourse.BUNNY_VIDEO_LIBRARY_ID}/${video_id}`
        });
        res.status(201).send({
            success: true,
            message: `Lecture added successfully!`
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.addThumbNail = async (req, res) => {
    try {
        const id = req.params.id;
        const lecture = await Lecture.findOne({
            where: { id: id },
            include: [{
                model: AddCourse,
                as: 'addCourse'
            }]

        });
        if (!lecture) {
            return res.status(400).send({
                success: false,
                message: "Lecture is not present!"
            });
        };
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a file for thumbnail!"
            });
        }
        // add to buuny video
        const setThumbNail = {
            method: "POST",
            url: `http://video.bunnycdn.com/library/${lecture.addCourse.BUNNY_LIBRARY_API_KEY}/videos/${lecture.Video_ID}/thumbnail`,
            params: {
                thumbnailUrl: req.body.url
            },
            headers: {
                Accept: "application/json",
                AccessKey: lecture.addCourse.BUNNY_LIBRARY_API_KEY,
            }
        };
        await axios
            .request(setThumbNail)
            .then((response) => {
                // console.log("resposse: ", response.data);
            })
            .catch((error) => {
                // console.log(error);
                deleteFile(req.file.path);
                return res.status(400).json({
                    success: false,
                    error: "failed to upload thumbnail!"
                });
            });
        await lecture.update({
            ...lecture,
            Thumbnail_URL: req.file.path
        });
        res.status(201).send({
            success: true,
            message: `Lecture,s thumbnail added successfully!`
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.addLectureFile = async (req, res) => {
    try {
        const id = req.params.id;
        const lecture = await Lecture.findOne({ where: { id: id } });
        if (!lecture) {
            return res.status(400).send({
                success: false,
                message: "Lecture is not present!"
            });
        };
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a file!"
            });
        }
        await lecture.update({
            ...lecture,
            file: req.file.path
        });
        res.status(201).send({
            success: true,
            message: `Lecture,s file added successfully! ID: ${lecture.id}`
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.getLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findAll({
            where: {
                section_id: req.params.section_id // id:rer.params.id 
            }
        });
        res.status(200).send({
            success: true,
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
            return res.status(400).send({
                success: false,
                message: "Lecture is not present!"
            });
        };
        const addCourse = await AddCourse.findOne({ where: { id: lecture.addCourse_id } });
        // delete lecture file
        if (lecture.file) {
            deleteFile(lecture.file);
        }
        // delete lecture thumbnail
        if (lecture.Thumbnail_URL) {
            deleteFile(lecture.Thumbnail_URL);
        }
        // delete file from bunny
        const deleteVideo = {
            method: "DELETE",
            url: `http://video.bunnycdn.com/library/${addCourse.BUNNY_VIDEO_LIBRARY_ID}/videos/${lecture.Video_ID}`,
            headers: {
                AccessKey: addCourse.BUNNY_LIBRARY_API_KEY,
            }
        };

        await axios
            .request(deleteVideo)
            .then((response) => {
                // console.log("delete: ", response.data);
            })
            .catch((error) => {
                // console.log(error);
                res.status(200).json({ error: "failed!" });
            });
        // delete lecture from database
        await lecture.destroy();
        res.status(200).send({
            success: true,
            message: `Lecture deleted successfully! Id: ${id}`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

// update text, quiz, customCode, richTextEditor, codeExample
exports.updateLecture = async (req, res) => {
    try {
        const id = req.params.id;
        const { text, quiz, codeExample, customCode, richTextEditor } = req.body;
        const lecture = await Lecture.findOne({ where: { id: id } });
        if (!lecture) {
            return res.status(400).send({
                success: false,
                message: "Lecture is not present!"
            });
        }
        await lecture.update({
            ...lecture,
            text: text,
            quiz: quiz,
            codeExample: codeExample,
            customCode: customCode,
            richTextEditor: richTextEditor
        });
        res.status(200).send({
            success: true,
            message: `Lecture modified successfully! ID: ${id}`
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
