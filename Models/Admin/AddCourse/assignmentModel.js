module.exports = (sequelize, DataTypes) => {
    const Assignment = sequelize.define("assignment", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        question: {
            type: DataTypes.STRING(1234)
        },
        assignmentType: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['SCHEDULE CALL', 'ANSWER', 'INFORMATION', 'AFFILIATE LINK']]
            }
        }
    }, {
        paranoid: true
    });
    return Assignment;
};

// courseId
// sectionId
// lessonId
// adminId