module.exports = (sequelize, DataTypes) => {
    const ShareSaleLink = sequelize.define("shareSaleLinks", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        originalLink: {
            type: DataTypes.STRING,
            allowNull: false
        },
        saleLinkTag: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        numberOfHit: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        socialMedia: {
            type: DataTypes.STRING
        },
        productId: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return ShareSaleLink;
};

// foreignKey
// adminId