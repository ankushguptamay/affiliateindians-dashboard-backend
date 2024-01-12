const path = require("path");
const multer = require("multer");

const filter = (req, file, cb) => {
    // console.log(file)
    const extention = (file.originalname).split(".");
    const lastExtention = extention.length - 1;
    // console.log(extention[lastExtention]);
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else if (file.mimetype.startsWith("application/pdf")) {
        cb(null, true);
    } else if (extention[lastExtention] === "docx" || extention[lastExtention] === "zip" || extention[lastExtention] === "doc" || extention[lastExtention] === "ppt" || extention[lastExtention] === "pptx") {
        cb(null, true);
    } else {
        cb("Please upload only Image, PDF, DOCX, DOC, PPT and PPTX.", false);
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
uploadImageDocumentPresentation = multer({ storage: storage, fileFilter: filter });

module.exports = uploadImageDocumentPresentation;