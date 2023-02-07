module.exports = (sequelize, DataTypes) => {
    const AddCourse = sequelize.define("addCourse", {
        title: {
            type: DataTypes.STRING,
        },
        subTitle: {
            type: DataTypes.STRING,
        },
        categories: {
            type: DataTypes.STRING,
        },
        authorName: {
            type: DataTypes.STRING,
        },
        authorImage: {
            type: DataTypes.STRING,
        },
        courseImage: {
            type: DataTypes.STRING,
        }
    });
    return AddCourse;
};