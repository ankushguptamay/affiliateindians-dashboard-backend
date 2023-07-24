module.exports = (sequelize, DataTypes) => {
    const LecturesQuiz = sequelize.define("lecturesQuiz", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        quizQuestion: {
            type: DataTypes.STRING
        },
        optionA: {
            type: DataTypes.STRING
        },
        optionB: {
            type: DataTypes.STRING
        },
        optionC: {
            type: DataTypes.STRING
        },
        optionD: {
            type: DataTypes.STRING
        }
       
    });
    return LecturesQuiz;
};

// courseId
// sectionId
// lectureId