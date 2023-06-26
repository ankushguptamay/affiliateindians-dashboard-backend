const path = require("path");
const multer = require("multer");

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("application/pdf")) {
        cb(null, true);
    } else {
        cb("Please upload only PDF.", false);
    }
};

var storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (file.fieldname === "lecturePDFile") {
            cb(null, path.join(`${__dirname}/../../Resource/Lecture/PDFile`));
        }
    },
    filename: (req, file, callback) => {
        var filename = `${Date.now()}-${file.originalname}`;
        callback(null, filename);
    }
});
uploadPDF = multer({ storage: storage, fileFilter: imageFilter });

module.exports = uploadPDF;