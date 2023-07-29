module.exports = (sequelize, DataTypes) => {
    const VideoComment = sequelize.define("videoComment", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        filePath: {
            type: DataTypes.STRING(1234)
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
        }

    });
    return VideoComment;
};

// courseId
// sectionId
// lessonId
// lessonVideoId