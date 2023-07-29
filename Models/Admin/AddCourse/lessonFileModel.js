module.exports = (sequelize, DataTypes) => {
    const LessonFile = sequelize.define("lessonFile", {
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
    return LessonFile;
};

// courseId
// sectionId
// lessonId