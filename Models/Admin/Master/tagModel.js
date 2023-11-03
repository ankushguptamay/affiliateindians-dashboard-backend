module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define("tags", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        tagName: {
            type: DataTypes.STRING //their should GENERAL tag applicable for all
        },
        tagCode: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return Tag;
};