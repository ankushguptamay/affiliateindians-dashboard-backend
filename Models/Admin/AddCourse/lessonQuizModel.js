module.exports = (sequelize, DataTypes) => {
    const LessonQuiz = sequelize.define("lessonQuiz", {
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
        },
        quizAsAssignment: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        answer: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return LessonQuiz;
};

// courseId
// sectionId
// lessonId
// adminId