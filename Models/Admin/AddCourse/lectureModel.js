module.exports = (sequelize, DataTypes) => {
    const Lecture = sequelize.define("lecture", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        lessonName: {
            type: DataTypes.STRING
        },
        codeExample: {
            type: DataTypes.TEXT
        },
        customCode: {
            type: DataTypes.TEXT
        },
        richTextEditor: {
            type: DataTypes.TEXT
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
    return Lecture;
};

// sectionId
// courseId
// adminId