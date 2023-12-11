module.exports = (sequelize, DataTypes) => {
    const LessonFile = sequelize.define("lessonFile", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        file_FieldName: {
            type: DataTypes.STRING // resourse, pdf Viewer, banner Image
        },
        file_Path: {
            type: DataTypes.STRING(1234)
        },
        file_MimeType: {
            type: DataTypes.STRING
        },
        file_OriginalName: {
            type: DataTypes.STRING
        },
        file_FileName: {
            type: DataTypes.STRING
        },
        fileAsAssignment: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        cloudinaryFileId: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return LessonFile;
};

// courseId
// sectionId
// lessonId
// adminId