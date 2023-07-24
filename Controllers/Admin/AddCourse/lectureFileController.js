const db = require('../../../Models');
const Lecture = db.lecture;
const LecturesFile = db.lectureFile;
const LecturesVideo = db.lectureVideo;
const LecturesQuiz = db.lectureQuiz;
const { deleteSingleFile } = require("../../../Util/deleteFile");