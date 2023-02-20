module.exports = (sequelize, DataTypes) => {
    const Section = sequelize.define("section",{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        }
    }, {
        timestamps: false
    });
    return Section;
};