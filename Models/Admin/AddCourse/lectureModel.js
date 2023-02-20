module.exports = (sequelize, DataTypes) => {
    const Lecture = sequelize.define("lecture", {
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
    });
    return Lecture;
};