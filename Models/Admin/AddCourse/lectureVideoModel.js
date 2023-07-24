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
        Iframe_URL: {
            type: DataTypes.STRING(1234) 
        },
        BUNNY_VIDEO_LIBRARY_ID:{
            type: DataTypes.STRING
        },
        BUNNY_LIBRARY_API_KEY:{
            type: DataTypes.STRING
        }
       
    });
    return LecturesVideo;
};

// courseId
// sectionId
// lectureId