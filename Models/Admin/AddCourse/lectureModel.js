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
        PDFile: {
            type: DataTypes.STRING
        },
        text: {
            type: DataTypes.TEXT
        },
        quiz: {
            type: DataTypes.STRING
        },
        codeExample: {
            type: DataTypes.STRING
        },
        customCode: {
            type: DataTypes.STRING
        },
        richTextEditor: {
            type: DataTypes.TEXT
        },
        Direct_Play_URL: {
            type: DataTypes.STRING
        },
        Video_ID: {
            type: DataTypes.STRING
        },
        Thumbnail_URL: {
            type: DataTypes.STRING
        },
        Iframe_URL: {
            type: DataTypes.STRING
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
    return Lecture;
};