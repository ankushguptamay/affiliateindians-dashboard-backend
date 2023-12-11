module.exports = (sequelize, DataTypes) => {
    const LessonVideo = sequelize.define("lessonVideo", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        Direct_Play_URL: {
            type: DataTypes.STRING(1234)
        },
        Video_ID: {
            type: DataTypes.STRING
        },
        Iframe_URL: {
            type: DataTypes.STRING(1234)
        },
        Thumbnail_Path: {
            type: DataTypes.STRING(1234)
        },
        Thumbnail_OriginalName: {
            type: DataTypes.STRING
        },
        Thumbnail_FileName: {
            type: DataTypes.STRING
        },
        BUNNY_VIDEO_LIBRARY_ID: {
            type: DataTypes.STRING
        },
        BUNNY_LIBRARY_API_KEY: {
            type: DataTypes.STRING
        },
        videoName: {
            type: DataTypes.STRING
        },
        encodeProgress: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        embeddedVideoCode: {
            type: DataTypes.TEXT
        },
        videoType: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['EMBEDDEDCODE', 'VIDEO']]
            }
        },
        cloudinaryImageId: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return LessonVideo;
};

// courseId
// sectionId
// lessonId
// adminId