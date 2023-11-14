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
        option: {
            type: DataTypes.JSON
        },
        quizAsAssignment: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        answer: {
            type: DataTypes.JSON
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