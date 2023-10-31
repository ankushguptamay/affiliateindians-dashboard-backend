module.exports = (sequelize, DataTypes) => {
    const Section = sequelize.define("section", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        sectionName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        paranoid: true
    });
    return Section;
};

// courseId
// adminId