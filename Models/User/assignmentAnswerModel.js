module.exports = (sequelize, DataTypes) => {
    const AssignmentAnswer = sequelize.define("assignmentAnswer", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        answer: {
            type: DataTypes.TEXT
        }
    }, {
        paranoid: true
    });
    return AssignmentAnswer;
};

// userId
// assignmentId
// courseId
// sectionId
// lessonId