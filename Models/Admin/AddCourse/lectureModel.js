const { Model } = require("sequelize");
const { deleteFile } = require("../../../Util/deleteFile")
module.exports = (sequelize, DataTypes) => {
    class Lecture extends Model { };
    Lecture.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        video: {
            type: DataTypes.STRING,
        },
        file: {
            type: DataTypes.STRING,
        },
        text: {
            type: DataTypes.TEXT,
        },
        quiz: {
            type: DataTypes.STRING,
        },
        codeExample: {
            type: DataTypes.STRING,
        },
        customCode: {
            type: DataTypes.STRING,
        },
        richTextEditor: {
            type: DataTypes.TEXT,
        }
    }, {
        timestamps: false,
        sequelize,
        modelName: "lecture"
    });
    return Lecture;
};