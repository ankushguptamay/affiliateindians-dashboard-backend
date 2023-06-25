module.exports = (sequelize, DataTypes) => {
    const AddCourse = sequelize.define("addCourse", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING
        },
        subTitle: {
            type: DataTypes.STRING
        },
        categories: {
            type: DataTypes.STRING
        },
        authorName: {
            type: DataTypes.STRING
        },
        authorImage: {
            type: DataTypes.STRING
        },
        courseImage: {
            type: DataTypes.STRING
        },
        BUNNY_VIDEO_LIBRARY_ID: {
            type: DataTypes.STRING
        },
        BUNNY_LIBRARY_API_KEY: {
            type: DataTypes.STRING
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
    return AddCourse;
};