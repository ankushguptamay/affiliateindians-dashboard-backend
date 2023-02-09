const { addCourse } = require("../..");

module.exports = (sequelize, DataTypes) => {
    const AddCourse = sequelize.define("addCourse", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
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