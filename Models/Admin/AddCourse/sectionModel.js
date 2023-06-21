module.exports = (sequelize, DataTypes) => {
    const Section = sequelize.define("section",{
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        }
    }, {
        timestamps: false
    });
    return Section;
};