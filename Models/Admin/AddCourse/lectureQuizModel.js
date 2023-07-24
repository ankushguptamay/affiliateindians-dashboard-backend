module.exports = (sequelize, DataTypes) => {
    const lecturesQuiz = sequelize.define("lecturesQuiz", {
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
    return lecturesQuiz;
};

// courseId
// sectionId
// lectureId