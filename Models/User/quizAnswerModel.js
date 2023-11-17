module.exports = (sequelize, DataTypes) => {
    const Quiz_Answer = sequelize.define("quiz_answer", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        answer: {
            type: DataTypes.JSON
        }
    }, {
        paranoid: true
    });
    return Quiz_Answer;
};

// ForeignKey
// quizId
// userId
// courseId
// sectionId
// lessonId