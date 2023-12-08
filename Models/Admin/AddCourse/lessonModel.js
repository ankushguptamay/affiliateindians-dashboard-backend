module.exports = (sequelize, DataTypes) => {
    const Lesson = sequelize.define("lesson", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        lessonName: {
            type: DataTypes.STRING
        },
        codeExample: {
            type: DataTypes.TEXT("long")
        },
        customCode: {
            type: DataTypes.TEXT("long")
        },
        richTextEditor: {
            type: DataTypes.TEXT("long")
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        paranoid: true
    });
    return Lesson;
};

// sectionId
// courseId
// adminId