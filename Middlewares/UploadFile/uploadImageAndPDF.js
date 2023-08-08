const path = require("path");
const multer = require("multer");

const filter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else if (file.mimetype.startsWith("application/pdf")) {
        cb(null, true);
    } else {
        cb("Please upload only Image and PDF.", false);
    }
};

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "lessonResource") {
            cb(null, path.join(`${__dirname}/../../Resources/Lesson`));
        } else if (file.fieldname === "commentFile") {
            cb(null, path.join(`${__dirname}/../../Resources/Lesson`));
        }
    },
    filename: (req, file, callback) => {
        var filename = `${Date.now()}-${file.originalname}`;
        callback(null, filename);
    }
});
uploadPDFAndImage = multer({ storage: storage, fileFilter: filter });

module.exports = uploadPDFAndImage;