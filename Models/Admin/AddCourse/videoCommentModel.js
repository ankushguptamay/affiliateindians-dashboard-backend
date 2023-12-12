module.exports = (sequelize, DataTypes) => {
    const VideoComment = sequelize.define("videoComment", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        file_Path: {
            type: DataTypes.STRING(1234)
        },
        file_OriginalName: {
            type: DataTypes.STRING
        },
        file_FileName: {
            type: DataTypes.STRING
        },
        message: {
            type: DataTypes.TEXT
        },
        commenterName: {
            type: DataTypes.STRING
        },
        commenterId: {
            type: DataTypes.STRING
        },
        mimeType: {
            type: DataTypes.STRING
        },
        approvalStatus: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        cloudinaryFileId: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return VideoComment;
};

// courseId
// sectionId
// lessonId
// lessonVideoId