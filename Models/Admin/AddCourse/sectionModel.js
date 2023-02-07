module.exports = (sequelize, DataTypes) => {
    const CourseSection = sequelize.define("courseSection", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    });
    return CourseSection;
};