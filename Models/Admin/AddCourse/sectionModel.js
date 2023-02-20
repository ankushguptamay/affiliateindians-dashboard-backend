const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Section extends Model { };
    Section.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        }
    }, {
        timestamps: false,
        sequelize,
        modelName: "section"
    });
    return Section;
};