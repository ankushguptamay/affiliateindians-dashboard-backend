const path = require("path");
const multer = require("multer");

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else if (file.mimetype.startsWith("application/pdf")) {
        cb(null, true);
    } else {
        cb("Please upload only Image or PDF.", false);
    }
};

var storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (file.mimetype === "application/pdf") {
            callback(null, path.join(`${__dirname}/../Resources/UploadPDF`));
        } else {
            callback(null, path.join(`${__dirname}/../Resources/UploadImages`));
        }
    },
    filename: (req, file, callback) => {
        var filename = `${Date.now()}-${file.originalname}`;
        callback(null, filename);
    }
});
uploadImageOrPDF = multer({ storage: storage, fileFilter: imageFilter });

module.exports = uploadImageOrPDF;