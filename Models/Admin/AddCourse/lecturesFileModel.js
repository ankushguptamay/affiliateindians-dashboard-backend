module.exports = (sequelize, DataTypes) => {
    const LecturesFile = sequelize.define("lecturesFile", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        fileName: {
            type: DataTypes.STRING // resourse, pdf Viewer, banner Image
        },
        filePath: {
            type: DataTypes.STRING(1234) 
        },
        mimeType: {
            type: DataTypes.STRING
        }
       
    });
    return LecturesFile;
};

// courseId
// sectionId
// lectureId