module.exports = (sequelize, DataTypes) => {
    const UpSell = sequelize.define("upSell", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        buttonText: {
            type: DataTypes.STRING
        },
        buttonLink: {
            type: DataTypes.STRING(1234)
        }
    }, {
        paranoid: true
    });
    return UpSell;
};

// lessonId
// adminId