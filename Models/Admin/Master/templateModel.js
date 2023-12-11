module.exports = (sequelize, DataTypes) => {
    const Template = sequelize.define("templates", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        template: {
            type: DataTypes.STRING
        },
        templateImage_Path: {
            type: DataTypes.STRING(1234)
        },
        templateImage_OriginalName: {
            type: DataTypes.STRING
        },
        templateImage_FileName: {
            type: DataTypes.STRING(1234)
        },
        cloudinaryImageId: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return Template;
};