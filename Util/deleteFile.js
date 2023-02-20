const fs = require('fs');

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            throw (err);
        }
    })
}

const deleteMultiFile = (filePath) => {
    filePath.map(path => fs.unlink(path, (err) => {
        if (err) {
            throw (err);
        }
    }))
}

module.exports = {
    deleteFile: deleteFile,
    deleteMultiFile: deleteMultiFile
};