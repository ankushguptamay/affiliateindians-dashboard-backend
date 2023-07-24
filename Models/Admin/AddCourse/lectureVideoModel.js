module.exports = (sequelize, DataTypes) => {
    const LecturesVideo = sequelize.define("lecturesVideo", {
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
        Thumbnail_URL: {
            type: DataTypes.STRING(1234) 
        },
        Iframe_URL: {
            type: DataTypes.STRING(1234) 
        },
       
    });
    return LecturesVideo;
};

// courseId
// sectionId
// lectureId