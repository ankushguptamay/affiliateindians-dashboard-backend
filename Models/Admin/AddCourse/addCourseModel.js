const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AddCourse extends Model { };
    AddCourse.init({
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
    }, {
        timestamps: false,
        sequelize,
        modelName: "addCourse"
    });
    return AddCourse;
};