module.exports = (sequelize, DataTypes) => {
    const LessonText = sequelize.define("lessonTexts", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        text: {
            type: DataTypes.TEXT("long")
        },
        textType: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['RICHTEXT', 'CUSTOMCODE', 'CODEEXAMPLE']]
            }
        },
    }, {
        paranoid: true
    });
    return LessonText;
};

// courseId
// sectionId
// lessonId
// adminId