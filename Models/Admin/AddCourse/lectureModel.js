module.exports = (sequelize, DataTypes) => {
    const Lecture = sequelize.define("lecture", {
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
    });
    return Lecture;
};