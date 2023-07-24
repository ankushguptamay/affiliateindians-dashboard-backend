module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define("course", {
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
            type: DataTypes.STRING(1234) 
        },
        courseImage: {
            type: DataTypes.STRING(1234) 
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
        },
        forWhom: {
            type: DataTypes.STRING,
            defaultValue: "paid" // free, or paid
        }
    });
    return Course;
};

// adminId